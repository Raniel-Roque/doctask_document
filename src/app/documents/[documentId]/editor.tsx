"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import ImageResize from "tiptap-extension-resize-image";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Underline from "@tiptap/extension-underline";
import FontFamily from "@tiptap/extension-font-family";
import TextStyle from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import TextAlign from '@tiptap/extension-text-align'

import { useEditorStore } from "@/store/use-editor-store";
import { FontSizeExtension } from "@/extensions/font-size";
import { LineHeightExtension } from "@/extensions/line-height";
import { Ruler } from "./ruler";
import { useLiveblocksExtension } from "@liveblocks/react-tiptap";
import { Threads } from "./threads";
import { useStorage } from "@liveblocks/react";
import { LEFT_MARGIN_DEFAULT, RIGHT_MARGIN_DEFAULT } from "@/constants/margins";
import { DEFAULT_FONT } from "@/constants/page_settings";

interface EditorProps {
    initialContent?: string | undefined;
};

export const Editor = ({ initialContent }: EditorProps) => {
    const leftMargin = useStorage((root) => root.leftMargin ?? LEFT_MARGIN_DEFAULT );
    const rightMargin = useStorage((root) => root.rightMargin ?? RIGHT_MARGIN_DEFAULT);

    const liveblocks = useLiveblocksExtension({
        initialContent,
        offlineSupport_experimental: true,
    });

    const { setEditor } = useEditorStore();

    const editor = useEditor({
        immediatelyRender: false,
        onCreate({ editor }) {
            setEditor(editor);
        },
        onDestroy() {
            setEditor(null);
        },
        onUpdate({ editor }) {
            setEditor(editor);
        },
        editorProps: {
            attributes: {
                style: `padding-left: ${leftMargin}px; padding-right: ${rightMargin}px; font-family: '${DEFAULT_FONT}', serif; font-size: 11px;`,
                class: "focus:outline-none print:border-0 bg-white border border-[#C7C7C7] flex flex-col min-h-[1054px] w-[816px] pt-10 pr-14 pb-10 cursor-text",
            },
            handleDOMEvents: {
                mouseover: (view, event) => {
                    const target = event.target as HTMLElement;
                    if (target.nodeName === "A") {
                        target.setAttribute("title", target.getAttribute("href") || "");
                    }
                },
            },
        },
        extensions: [
            liveblocks,
            StarterKit.configure({
                history: false,
            }),
            TaskList,
            Table.configure({
                resizable: false,
            }),
            TaskItem.configure({
                nested: true,
            }),
            Image,
            TableRow,
            TableHeader,
            TableCell,
            ImageResize,
            Underline,
            FontFamily,
            TextStyle,
            Highlight.configure({
                multicolor: true,
            }),
            Color,
            Link.configure({
                openOnClick: false,
                autolink: true,
                defaultProtocol: "https",
                linkOnPaste: true,
            }),
            TextAlign.configure({
                types: ["heading", "paragraph"]
            }),
            FontSizeExtension,
            LineHeightExtension.configure({
                types: ["heading", "paragraph"],
                defaultLineHeight: "1.5"
            })
        ],
        content: ``,
    });

    return (
        <div className="size-full overflow-x-auto bg-[#F9FBFD] px-4 print:p-0 print:bg-white print-overflow-visible">
            <Ruler />
            <div className="min-w-max flex justify-center w-[816px] py-4 print:py-0 mx-auto print:w-full print:min-w-0">
                <EditorContent editor={editor} />
                <Threads editor={editor}/>
            </div>
        </div>
    );
};