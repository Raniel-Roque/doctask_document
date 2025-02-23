"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react"; // Add useState for managing table selection

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

import { DocumentInput } from "./document-input";
import { BoldIcon, FileIcon, FileJsonIcon, FilePenIcon, FilePlusIcon, FileTextIcon, GlobeIcon, ItalicIcon, PrinterIcon, Redo2Icon, RemoveFormattingIcon, StrikethroughIcon, TextIcon, TrashIcon, UnderlineIcon, Undo2Icon } from "lucide-react";
import { BsFilePdf } from "react-icons/bs";

export const Navbar = () => {
    const [selectedRows, setSelectedRows] = useState(1); // State for selected rows
    const [selectedCols, setSelectedCols] = useState(1); // State for selected columns

    const createTable = (rows: number, cols: number) => {
        // Function to create a table with the specified rows and columns
        console.log(`Creating table with ${rows} rows and ${cols} columns`);
        // You can integrate this with your editor logic here
    };

    return (
        <nav className="flex items-center justify-between">
            <div className="flex gap-2 items-center">
                <Link href="/">
                    <Image src="/logo.svg" alt="Logo" width={36} height={36}/>
                </Link>
                <div className="flex flex-col">
                    <DocumentInput />
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
                                            <MenubarItem>
                                                <FileJsonIcon className="mr-2 size-4"/>
                                                JSON
                                            </MenubarItem>
                                            <MenubarItem>
                                                <GlobeIcon className="mr-2 size-4"/>
                                                HTML
                                            </MenubarItem>
                                            <MenubarItem>
                                                <BsFilePdf className="mr-2 size-4"/>
                                                PDF
                                            </MenubarItem>
                                            <MenubarItem>
                                                <FileTextIcon className="mr-2 size-4"/>
                                                Text
                                            </MenubarItem>
                                        </MenubarSubContent>
                                    </MenubarSub>
                                    <MenubarItem>
                                        <FilePlusIcon className="mr-2 size-4"/>
                                        New Document
                                    </MenubarItem>
                                    <MenubarSeparator />
                                    <MenubarItem>
                                        <FilePenIcon className="mr-2 size-4"/>
                                        Rename
                                    </MenubarItem>
                                    <MenubarItem>
                                        <TrashIcon className="mr-2 size-4"/>
                                        Remove
                                    </MenubarItem>
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
                                    <MenubarItem>
                                        <Undo2Icon className="mr-2 size-4"/>
                                        Undo <MenubarShortcut>⌘Z</MenubarShortcut>
                                    </MenubarItem>
                                    <MenubarItem>
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
                                            <MenubarItem>
                                                <BoldIcon className="mr-2 size-4"/>
                                                Bold <MenubarShortcut>⌘B</MenubarShortcut>
                                            </MenubarItem>
                                            <MenubarItem>
                                                <ItalicIcon className="mr-2 size-4"/>
                                                Italic <MenubarShortcut>⌘I</MenubarShortcut>
                                            </MenubarItem>
                                            <MenubarItem>
                                                <UnderlineIcon className="mr-2 size-4"/>
                                                Underline <MenubarShortcut>⌘U</MenubarShortcut>
                                            </MenubarItem>
                                            <MenubarItem>
                                                <StrikethroughIcon className="mr-2 size-4"/>
                                                Strikethrough
                                            </MenubarItem>
                                        </MenubarSubContent>
                                    </MenubarSub>
                                    
                                    <MenubarItem>
                                        <RemoveFormattingIcon className="mr-2 size-4"/>
                                        Clear Formatting 
                                    </MenubarItem>
                                </MenubarContent>
                            </MenubarMenu>

                        </Menubar>
                    </div>
                </div>
            </div>
        </nav>
    )
}