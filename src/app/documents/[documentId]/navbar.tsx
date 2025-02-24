"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react"; 
import { RemoveDialog } from "../../(home)/remove-dialog";
import { RenameDialog } from "../../(home)/rename-dialog";
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarShortcut,
    MenubarSub,
    MenubarSubContent,
    MenubarSubTrigger,
    MenubarTrigger
} from "@/components/ui/menubar"

import { Avatars } from "./avatars";
import { Inbox } from "./inbox";
import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import { DocumentInput } from "./document-input";
import { BoldIcon, FileIcon, FileJsonIcon, FilePenIcon, FilePlusIcon, FileTextIcon, GlobeIcon, ItalicIcon, PrinterIcon, Redo2Icon, RemoveFormattingIcon, StrikethroughIcon, TextIcon, TrashIcon, UnderlineIcon, Undo2Icon } from "lucide-react";
import { BsFilePdf, BsFiletypeDocx } from "react-icons/bs";
import { useEditorStore } from "@/store/use-editor-store";
import { Doc } from "../../../../convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface NavbarProps {
    data: Doc<"documents">;
};

export const Navbar = ({ data }: NavbarProps) => {
    const router = useRouter();

    const [selectedRows, setSelectedRows] = useState(1); 
    const [selectedCols, setSelectedCols] = useState(1);
    const  { editor } = useEditorStore()

    const mutation = useMutation(api.documents.create);

    const onNewDocument = () => {
        mutation({
            title: "Untitled Document",
            initialContent: ""
        })
        .catch(() => toast.error("Something went wrong"))
        .then((id) => {
            toast.success("Document Created")
            router.push(`/documents/${id}`)
        })
    };

    const createTable = (rows: number, cols: number) => {
        editor?.chain().focus().insertTable({ rows, cols, withHeaderRow: false}).run()
    };

    const onDownload = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
    }

    const onSaveJSON = () => {
        if (!editor) return;

        const content = editor.getJSON();
        const blob = new Blob([JSON.stringify(content)], {
            type: "application/json",
        });

        onDownload(blob, `${data.title}.json`)
    }

    const onSaveHTML = () => {
        if (!editor) return;

        const content = editor.getHTML();
        const blob = new Blob([content], {
            type: "text/html",
        });

        onDownload(blob, `${data.title}.html`) 
    }

    const onSaveText = () => {
        if (!editor) return;

        const content = editor.getText();
        const blob = new Blob([content], {
            type: "text/plain",
        });

        onDownload(blob, `${data.title}.txt`) 
    }

    return (
        <nav className="flex items-center justify-between">
            <div className="flex gap-2 items-center">
                <Link href="/">
                    <Image src="/logo.svg" alt="Logo" width={36} height={36}/>
                </Link>
                <div className="flex flex-col">
                    <DocumentInput title={data?.title} id={data._id} />
                    <div className="flex">
                        <Menubar className="border-none bg-transparent shadow-none h-auto p-0">
                            
                            {/* FILE */}
                            <MenubarMenu>
                                <MenubarTrigger className="text-sm font-normal py-0.5 px-[7px] rounded-sm hover:bg-muted h-auto">
                                    File
                                </MenubarTrigger>
                                <MenubarContent className="print:hidden">
                                    <MenubarSub>
                                        <MenubarSubTrigger>
                                            <FileIcon className="mr-2 size-4" />
                                            Save
                                        </MenubarSubTrigger>
                                        <MenubarSubContent>
                                            <MenubarItem onClick={onSaveJSON}>
                                                <FileJsonIcon className="mr-2 size-4"/>
                                                JSON
                                            </MenubarItem>
                                            <MenubarItem onClick={onSaveHTML}>
                                                <GlobeIcon className="mr-2 size-4"/>
                                                HTML
                                            </MenubarItem>
                                            <MenubarItem onClick={() => window.print()}> {/*TODOOOOO PDF EXPORT */}
                                                <BsFilePdf className="mr-2 size-4"/>
                                                PDF
                                            </MenubarItem>
                                            <MenubarItem onClick={() => {}}> {/*TODOOOOO DOCX EXPORT */}
                                                <BsFiletypeDocx className="mr-2 size-4"/>
                                                Docx
                                            </MenubarItem>
                                            <MenubarItem onClick={onSaveText}>
                                                <FileTextIcon className="mr-2 size-4"/>
                                                Text
                                            </MenubarItem>
                                        </MenubarSubContent>
                                    </MenubarSub>
                                    <MenubarItem onClick={onNewDocument}>
                                        <FilePlusIcon className="mr-2 size-4"/>
                                        New Document
                                    </MenubarItem>
                                    <MenubarSeparator />
                                    <RenameDialog documentId={data._id} initialTitle={data.title}>
                                        <MenubarItem onClick={(e) => e.stopPropagation} onSelect={(e) => e.preventDefault()}>
                                            <FilePenIcon className="mr-2 size-4"/>
                                            Rename
                                        </MenubarItem>
                                    </RenameDialog>
                                    <RemoveDialog documentId={data._id}>
                                        <MenubarItem onClick={(e) => e.stopPropagation} onSelect={(e) => e.preventDefault()}>
                                            <TrashIcon className="mr-2 size-4"/>
                                            Delete
                                        </MenubarItem>
                                    </RemoveDialog>
                                    <MenubarSeparator />
                                    <MenubarItem onClick={() => window.print()}>
                                        <PrinterIcon className="mr-2 size-4"/>
                                        Print <MenubarShortcut>⌘P</MenubarShortcut>
                                    </MenubarItem>
                                </MenubarContent>
                            </MenubarMenu>

                            {/* EDIT */}
                            <MenubarMenu>
                                <MenubarTrigger className="text-sm font-normal py-0.5 px-[7px] rounded-sm hover:bg-muted h-auto">
                                    Edit
                                </MenubarTrigger>
                                <MenubarContent>
                                    <MenubarItem onClick={() => editor?.chain().focus().undo().run()}>
                                        <Undo2Icon className="mr-2 size-4"/>
                                        Undo <MenubarShortcut>⌘Z</MenubarShortcut>
                                    </MenubarItem>
                                    <MenubarItem onClick={() => editor?.chain().focus().redo().run()}>
                                        <Redo2Icon className="mr-2 size-4"/>
                                        Redo <MenubarShortcut>⌘Y</MenubarShortcut>
                                    </MenubarItem>
                                </MenubarContent>
                            </MenubarMenu>

                            {/* INSERT */}
                            <MenubarMenu>
                                <MenubarTrigger className="text-sm font-normal py-0.5 px-[7px] rounded-sm hover:bg-muted h-auto">
                                    Insert
                                </MenubarTrigger>
                                <MenubarContent>
                                    <MenubarSub>
                                        <MenubarSubTrigger>Table</MenubarSubTrigger>
                                        <MenubarSubContent>
                                            {/* 10x10 Table Grid */}
                                            <div className="p-2">
                                                <div className="grid grid-cols-10 gap-0.5 w-[200px]"> {/* Adjusted grid size */}
                                                    {Array.from({ length: 10 * 10 }).map((_, index) => {
                                                        const row = Math.floor(index / 10) + 1;
                                                        const col = (index % 10) + 1;
                                                        return (
                                                            <div
                                                                key={index}
                                                                onMouseEnter={() => {
                                                                    setSelectedRows(row);
                                                                    setSelectedCols(col);
                                                                }}
                                                                onClick={() => createTable(row, col)}
                                                                className={`w-4 h-4 border border-neutral-400 cursor-pointer ${
                                                                    row <= selectedRows && col <= selectedCols ? "bg-neutral-300" : "bg-white"
                                                                }`}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                                <div className="mt-2 text-sm text-center">
                                                    {selectedCols} × {selectedRows}
                                                </div>
                                            </div>
                                        </MenubarSubContent>
                                    </MenubarSub>
                                </MenubarContent>
                            </MenubarMenu>

                            {/* FORMAT */}
                            <MenubarMenu>
                                <MenubarTrigger className="text-sm font-normal py-0.5 px-[7px] rounded-sm hover:bg-muted h-auto">
                                    Format
                                </MenubarTrigger>
                                <MenubarContent>
                                    <MenubarSub>
                                        <MenubarSubTrigger>
                                            <TextIcon className="mr-2 size-4"/>
                                            Text
                                        </MenubarSubTrigger>
                                        <MenubarSubContent className="min-w-[170px]">
                                            <MenubarItem onClick={() => editor?.chain().focus().toggleBold().run()}>
                                                <BoldIcon className="mr-2 size-4"/>
                                                Bold <MenubarShortcut>⌘B</MenubarShortcut>
                                            </MenubarItem>
                                            <MenubarItem onClick={() => editor?.chain().focus().toggleItalic().run()}>
                                                <ItalicIcon className="mr-2 size-4"/>
                                                Italic <MenubarShortcut>⌘I</MenubarShortcut>
                                            </MenubarItem>
                                            <MenubarItem onClick={() => editor?.chain().focus().toggleUnderline().run()}>
                                                <UnderlineIcon className="mr-2 size-4"/>
                                                Underline <MenubarShortcut>⌘U</MenubarShortcut>
                                            </MenubarItem>
                                            <MenubarItem onClick={() => editor?.chain().focus().toggleStrike().run()}>
                                                <StrikethroughIcon className="mr-2 size-4"/>
                                                Strikethrough
                                            </MenubarItem>
                                        </MenubarSubContent>
                                    </MenubarSub>
                                    
                                    <MenubarItem onClick={() => editor?.chain().focus().unsetAllMarks().run()}>
                                        <RemoveFormattingIcon className="mr-2 size-4"/>
                                        Clear Formatting 
                                    </MenubarItem>
                                </MenubarContent>
                            </MenubarMenu>

                        </Menubar>
                    </div>
                </div>
            </div>
            <div className="flex gap-3 items-center pl-6">
                <Inbox />
                <Avatars />
                <OrganizationSwitcher 
                    afterCreateOrganizationUrl="/"
                    afterLeaveOrganizationUrl="/"
                    afterSelectOrganizationUrl="/"
                    afterSelectPersonalUrl="/"
                />
                <UserButton />
            </div>
        </nav>
    )
}