#!/usr/bin/env python3
import os
import subprocess
import sys
import tempfile
import unittest
import xml.etree.ElementTree as ET

import xml_sorter


class TestXmlSorter(unittest.TestCase):
    def setUp(self):
        self.script_path = os.path.join(os.path.dirname(__file__), "xml_sorter.py")

    def run_cli(self, input_text, extra_args=None):
        cmd = [sys.executable, self.script_path, "-"]
        if extra_args:
            cmd.extend(extra_args)
        return subprocess.run(
            cmd,
            input=input_text,
            text=True,
            capture_output=True,
            encoding="utf-8",
        )

    def test_readme_example(self):
        before = (
            '<?xml version="1.0" encoding="utf-8"?>\n'
            "<configuration>\n"
            '    <zebra z="1" a="2"/>\n'
            "    <!-- User B comment -->\n"
            '    <item role="admin" id="b">\n'
            '        <setting name="theme" value="dark"/>\n'
            '        <setting name="lang" value="en"/>\n'
            "    </item>\n"
            "    <!-- User A comment -->\n"
            '    <item id="a" role="user"/>\n'
            "    <apple/>\n"
            "</configuration>\n"
        )
        expected = (
            "<?xml version='1.0' encoding='utf-8'?>\n"
            "<configuration>\n"
            "    <apple />\n"
            "    <!-- User A comment -->\n"
            '    <item id="a" role="user" />\n'
            "    <!-- User B comment -->\n"
            '    <item id="b" role="admin">\n'
            '        <setting name="lang" value="en" />\n'
            '        <setting name="theme" value="dark" />\n'
            "    </item>\n"
            '    <zebra a="2" z="1" />\n'
            "</configuration>\n"
        )
        res = self.run_cli(before)
        self.assertEqual(res.returncode, 0)
        self.assertEqual(res.stdout, expected)

    def test_trailing_comments_stay_at_end(self):
        xml_in = (
            "<root>\n"
            "    <!-- Comment for B -->\n"
            "    <b/>\n"
            "    <!-- Comment for A -->\n"
            "    <a/>\n"
            "    <!-- Trailing footer comment -->\n"
            "</root>\n"
        )
        res = self.run_cli(xml_in, ["--indent", "2"])
        self.assertEqual(res.returncode, 0)
        expected = (
            "<root>\n"
            "  <!-- Comment for A -->\n"
            "  <a />\n"
            "  <!-- Comment for B -->\n"
            "  <b />\n"
            "  <!-- Trailing footer comment -->\n"
            "</root>\n"
        )
        self.assertEqual(res.stdout, expected)

    def test_custom_sort_keys(self):
        xml_in = (
            "<root>\n"
            '    <entry custom="2" id="1"/>\n'
            '    <entry custom="1" id="2"/>\n'
            "</root>\n"
        )
        res = self.run_cli(xml_in, ["--sort-keys", "custom,id"])
        self.assertEqual(res.returncode, 0)
        root = ET.fromstring(res.stdout)
        self.assertEqual([el.attrib["custom"] for el in root], ["1", "2"])

    def test_utf8_bom_and_umlauts(self):
        xml_in = '\ufeff<?xml version="1.0" encoding="utf-8"?>\n<root><b name="Ümlaut"/><a name="Äpfel"/></root>'
        res = self.run_cli(xml_in)
        self.assertEqual(res.returncode, 0)
        self.assertTrue(res.stdout.startswith("<?xml version='1.0' encoding='utf-8'?>"))
        self.assertIn('name="Äpfel"', res.stdout)
        self.assertIn('name="Ümlaut"', res.stdout)

    def test_reserved_namespace_does_not_abort_other_namespaces(self):
        xml_in = (
            '<root xmlns:xml="http://www.w3.org/XML/1998/namespace" '
            'xmlns:custom="http://example.com/ns">\n'
            "    <custom:b/>\n"
            "    <custom:a/>\n"
            "</root>\n"
        )
        res = self.run_cli(xml_in)
        self.assertEqual(res.returncode, 0)
        self.assertIn("xmlns:custom=", res.stdout)
        self.assertIn("<custom:a", res.stdout)

    def test_in_place_file_modification(self):
        with tempfile.NamedTemporaryFile("w+", suffix=".xml", delete=False, encoding="utf-8") as tmp:
            tmp.write("<root><b/><a/></root>")
            tmp_path = tmp.name

        try:
            res = subprocess.run(
                [sys.executable, self.script_path, tmp_path, "--in-place", "--indent", "2"],
                capture_output=True,
                text=True,
            )
            self.assertEqual(res.returncode, 0)
            with open(tmp_path, "r", encoding="utf-8") as f:
                content = f.read()
            self.assertEqual(content, "<root>\n  <a />\n  <b />\n</root>\n")
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)


if __name__ == "__main__":
    unittest.main()
