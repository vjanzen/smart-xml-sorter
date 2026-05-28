#!/usr/bin/env python3
import sys
import os
import argparse
import io
import xml.etree.ElementTree as ET

class CommentedTreeBuilder(ET.TreeBuilder):
    def comment(self, data):
        self.start(ET.Comment, {})
        self.data(data)
        self.end(ET.Comment)

def is_comment(element):
    return element.tag is ET.Comment

def fallback_indent(elem, level=0, space="  "):
    i = "\n" + level * space
    if len(elem):
        if not elem.text or not elem.text.strip():
            elem.text = i + space
        if not elem.tail or not elem.tail.strip():
            elem.tail = i
        for child in elem:
            fallback_indent(child, level + 1, space)
        if len(elem) > 0:
            last_child = elem[-1]
            if not last_child.tail or not last_child.tail.strip():
                last_child.tail = i
    else:
        if level and (not elem.tail or not elem.tail.strip()):
            elem.tail = i

def indent_tree(root, space="  "):
    if hasattr(ET, 'indent'):
        ET.indent(root, space=space)
    else:
        fallback_indent(root, space=space)

def sort_element_recursive(elem, sort_keys):
    for child in elem:
        if not is_comment(child):
            sort_element_recursive(child, sort_keys)

    if elem.attrib:
        elem.attrib = {k: elem.attrib[k] for k in sorted(elem.attrib.keys())}

    blocks = []
    current_comments = []
    for child in list(elem):
        if is_comment(child):
            current_comments.append(child)
        else:
            blocks.append({
                'elements': current_comments + [child],
                'main_el': child
            })
            current_comments = []
    
    if current_comments:
        blocks.append({
            'elements': current_comments,
            'main_el': None
        })

    def get_block_sort_key(block):
        main_el = block['main_el']
        if main_el is None:
            return (1, "", "", "", "", "")
        
        tag = main_el.tag
        tag_lower = tag.lower() if isinstance(tag, str) else str(tag).lower()
        tag_orig = tag if isinstance(tag, str) else str(tag)

        attr_val_lower = ""
        attr_val_orig = ""
        for key in sort_keys:
            if key in main_el.attrib:
                val = main_el.attrib[key]
                attr_val_lower = val.lower()
                attr_val_orig = val
                break
        
        attr_str = "".join(f"{k}={v}" for k, v in sorted(main_el.attrib.items()))

        return (0, tag_lower, tag_orig, attr_val_lower, attr_val_orig, attr_str)

    blocks.sort(key=get_block_sort_key)

    elem[:] = []
    for block in blocks:
        for child in block['elements']:
            elem.append(child)

def main():
    parser = argparse.ArgumentParser(description="Smart XML Sorter - CLI Tool")
    parser.add_argument("input_file", nargs="?", default="-", help="Input XML file path (default: '-' for stdin)")
    parser.add_argument("-o", "--output", help="Output file path (default: stdout)")
    parser.add_argument("--in-place", action="store_true", help="Modify input file in-place (incompatible with stdin)")
    parser.add_argument("-i", "--indent", type=int, default=4, help="Indentation spaces (default: 4)")
    parser.add_argument("--sort-keys", default="id,name,key", help="Comma-separated attribute keys to break ties (default: 'id,name,key')")

    args = parser.parse_args()
    sort_keys = [k.strip() for k in args.sort_keys.split(",") if k.strip()]

    if args.input_file == "-":
        if args.in_place:
            sys.stderr.write("Error: --in-place cannot be used with stdin.\n")
            sys.exit(1)
        xml_content = sys.stdin.read()
    else:
        try:
            with open(args.input_file, "r", encoding="utf-8") as f:
                xml_content = f.read()
        except Exception as e:
            sys.stderr.write(f"Error reading input file: {e}\n")
            sys.exit(1)

    if not xml_content.strip():
        sys.stderr.write("Error: XML content is empty.\n")
        sys.exit(1)

    has_xml_declaration = xml_content.strip().startswith("<?xml")

    try:
        ns_parser = ET.iterparse(io.BytesIO(xml_content.encode("utf-8")), events=['start-ns'])
        for _, (prefix, uri) in ns_parser:
            ET.register_namespace(prefix, uri)
    except Exception:
        pass

    try:
        xml_parser = ET.XMLParser(target=CommentedTreeBuilder())
        root = ET.fromstring(xml_content, parser=xml_parser)
    except Exception as e:
        sys.stderr.write(f"XML Parsing Error: {e}\n")
        sys.exit(1)

    sort_element_recursive(root, sort_keys)

    indent_str = " " * args.indent
    indent_tree(root, space=indent_str)

    try:
        out_bytes = ET.tostring(root, encoding="utf-8", xml_declaration=has_xml_declaration)
        out_str = out_bytes.decode("utf-8")
        if not out_str.endswith("\n"):
            out_str += "\n"
    except Exception as e:
        sys.stderr.write(f"Serialization Error: {e}\n")
        sys.exit(1)

    if args.in_place:
        try:
            with open(args.input_file, "w", encoding="utf-8") as f:
                f.write(out_str)
        except Exception as e:
            sys.stderr.write(f"Error writing in-place: {e}\n")
            sys.exit(1)
    elif args.output:
        try:
            with open(args.output, "w", encoding="utf-8") as f:
                f.write(out_str)
        except Exception as e:
            sys.stderr.write(f"Error writing output file: {e}\n")
            sys.exit(1)
    else:
        sys.stdout.write(out_str)

if __name__ == "__main__":
    main()
