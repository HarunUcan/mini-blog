"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu, FloatingMenu } from "@tiptap/react/menus";

import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";

// ✅ Explicit extensions (garanti)
import Heading from "@tiptap/extension-heading";
import Blockquote from "@tiptap/extension-blockquote";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";

import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";

import {
    PiTextB,
    PiTextItalic,
    PiTextStrikethrough,
    PiCode,
    PiCodeBlock,
    PiQuotes,
    PiListBullets,
    PiListNumbers,
    PiLinkSimple,
    PiTextHOne,
    PiTextHTwo,
    PiTextHThree,
    PiParagraph,
    PiPalette,
    PiCheckBold,
    PiXBold,
    PiPlus,
    PiImage as PiImageIcon,
} from "react-icons/pi";

interface EditorProps {
    content: string;
    onChange: (content: string) => void;

    /** Write page'den gelecek: /api/upload'a atıp url döndüren fonksiyon */
    onUploadImage?: (file: File) => Promise<string>;
}

function cx(...classes: Array<string | false | undefined | null>) {
    return classes.filter(Boolean).join(" ");
}

function Btn({
    active,
    disabled,
    title,
    onClick,
    children,
}: {
    active?: boolean;
    disabled?: boolean;
    title?: string;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            title={title}
            disabled={disabled}
            onMouseDown={(e) => e.preventDefault()} // ✅ selection bozulmasın
            onClick={onClick}
            className={cx(
                "inline-flex items-center justify-center rounded-full p-2 transition",
                "hover:bg-white/10 active:bg-white/15",
                disabled && "opacity-40 cursor-not-allowed",
                active && "bg-white/15 text-sky-300"
            )}
        >
            {children}
        </button>
    );
}

const COLOR_SWATCHES = ["#111827", "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#a855f7"];

export default function Editor({ content, onChange, onUploadImage }: EditorProps) {
    const [linkOpen, setLinkOpen] = useState(false);
    const [linkValue, setLinkValue] = useState("");
    const [headingOpen, setHeadingOpen] = useState(false);
    const [colorOpen, setColorOpen] = useState(false);

    // ✅ "+" insert menu state
    const [insertOpen, setInsertOpen] = useState(false);
    const fileRef = useRef<HTMLInputElement | null>(null);

    const editor = useEditor({
        extensions: [
            // ✅ StarterKit'ten bu node'ları kapatıyoruz ki çakışma olmasın
            StarterKit.configure({
                heading: false,
                blockquote: false,
                bulletList: false,
                orderedList: false,
                listItem: false,
            }),

            // ✅ Explicit: Bunlar kesin gelecek
            Heading.configure({ levels: [1, 2, 3] }),
            Blockquote,
            BulletList.configure({ keepMarks: true, keepAttributes: false }),
            OrderedList.configure({ keepMarks: true, keepAttributes: false }),
            ListItem,

            // Color
            TextStyle,
            Color.configure({ types: ["textStyle"] }),

            Image.configure({
                allowBase64: true,
                HTMLAttributes: {
                    class: "rounded-xl border border-gray-200 dark:border-gray-700",
                },
            }),
            Link.configure({
                openOnClick: false,
                autolink: true,
                linkOnPaste: true,
            }),
            Placeholder.configure({
                placeholder: "Tell your story...",
                emptyEditorClass:
                    "is-editor-empty before:content-[attr(data-placeholder)] before:text-gray-400 before:float-left before:pointer-events-none",
            }),
        ],
        content,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: "prose prose-lg max-w-full focus:outline-none dark:prose-invert",
            },
        },
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
    });

    useEffect(() => {
        if (!editor) return;

        const onSelection = () => {
            const isLink = editor.isActive("link");
            if (isLink) setLinkValue(editor.getAttributes("link").href ?? "");
            if (!isLink) setLinkOpen(false);

            setHeadingOpen(false);
            setColorOpen(false);

            // ✅ selection değişince insert menüyü kapat
            setInsertOpen(false);
        };

        editor.on("selectionUpdate", onSelection);
        return () => {
            editor.off("selectionUpdate", onSelection);
        };
    }, [editor]);

    const shouldShowBubble = useCallback(() => {
        if (!editor) return false;
        const { from, to } = editor.state.selection;
        return from !== to;
    }, [editor]);

    // ✅ "+" menü ne zaman görünsün?
    const shouldShowPlus = useCallback(() => {
        if (!editor) return false;

        // editor focus değilse gösterme
        if (!editor.isFocused) return false;

        // selection varsa bubble menu var, "+" gizle
        const { from, to } = editor.state.selection;
        if (from !== to) return false;

        // codeBlock içinde istemiyorsan kapatabilirsin:
        // if (editor.isActive("codeBlock")) return false;

        return true;
    }, [editor]);

    const currentHeadingLabel = useMemo(() => {
        if (!editor) return "P";
        if (editor.isActive("heading", { level: 1 })) return "H1";
        if (editor.isActive("heading", { level: 2 })) return "H2";
        if (editor.isActive("heading", { level: 3 })) return "H3";
        return "P";
    }, [editor, editor?.state.selection]);

    const setHeading = useCallback(
        (level?: 1 | 2 | 3) => {
            if (!editor) return;

            if (!level) editor.chain().focus().setParagraph().run();
            else editor.chain().focus().setHeading({ level }).run();

            setHeadingOpen(false);
        },
        [editor]
    );

    const applyColor = useCallback(
        (c: string) => {
            if (!editor) return;
            editor.chain().focus().setColor(c).run();
            setColorOpen(false);
        },
        [editor]
    );

    const clearColor = useCallback(() => {
        if (!editor) return;
        editor.chain().focus().unsetColor().run();
        setColorOpen(false);
    }, [editor]);

    const setOrUnsetLink = useCallback(() => {
        if (!editor) return;
        const url = linkValue.trim();

        if (!url) {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            setLinkOpen(false);
            return;
        }

        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        setLinkOpen(false);
    }, [editor, linkValue]);

    const unsetLink = useCallback(() => {
        if (!editor) return;
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
        setLinkOpen(false);
    }, [editor]);

    // ✅ Insert image actions
    const insertImageByUrl = useCallback(() => {
        if (!editor) return;
        const url = window.prompt("Image URL");
        if (!url) return;
        editor.chain().focus().setImage({ src: url }).run();
        setInsertOpen(false);
    }, [editor]);

    const pickUpload = useCallback(() => {
        fileRef.current?.click();
    }, []);

    if (!editor) return null;

    return (
        <div className="relative w-full">
            {/* ✅ FloatingMenu: satırın solunda + */}
            <FloatingMenu
                editor={editor}
                shouldShow={shouldShowPlus}
                className="flex items-center"
            >
                <div className="relative">
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setInsertOpen((v) => !v)}
                        className={cx(
                            "h-9 w-9 rounded-full",
                            "bg-zinc-900/90 text-white shadow-lg",
                            "ring-1 ring-white/10 hover:bg-zinc-900",
                            "flex items-center justify-center"
                        )}
                        title="Insert"
                    >
                        <PiPlus size={18} />
                    </button>

                    {insertOpen && (
                        <div
                            className="absolute left-12 top-0 z-50 min-w-[210px] rounded-2xl bg-zinc-900/95 p-2 text-white shadow-2xl ring-1 ring-white/10 backdrop-blur"
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            <button
                                type="button"
                                onClick={() => {
                                    if (!onUploadImage) {
                                        alert("onUploadImage prop'u verilmedi. WritePage'de Editor'a onUploadImage eklemelisin.");
                                        return;
                                    }
                                    pickUpload();
                                }}
                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-white/10"
                            >
                                <PiImageIcon /> Upload image
                            </button>

                            <button
                                type="button"
                                onClick={insertImageByUrl}
                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-white/10"
                            >
                                <PiLinkSimple /> Image URL
                            </button>
                        </div>
                    )}
                </div>
            </FloatingMenu>

            {/* hidden file input for content images */}
            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file || !editor) return;

                    if (!onUploadImage) {
                        alert("onUploadImage prop'u verilmedi. WritePage'de Editor'a onUploadImage eklemelisin.");
                        e.target.value = "";
                        return;
                    }

                    const url = await onUploadImage(file);
                    editor.chain().focus().setImage({ src: url }).run();

                    setInsertOpen(false);
                    e.target.value = "";
                }}
            />

            {/* BubbleMenu (SENİN MEVCUT MENÜN) */}
            <BubbleMenu
                editor={editor}
                shouldShow={shouldShowBubble}
                className="flex items-center gap-2 rounded-full bg-zinc-900/95 text-white px-2 py-2 shadow-2xl ring-1 ring-white/10 backdrop-blur"
            >
                <Btn title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
                    <PiTextB size={18} />
                </Btn>
                <Btn title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
                    <PiTextItalic size={18} />
                </Btn>
                <Btn title="Strike" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
                    <PiTextStrikethrough size={18} />
                </Btn>
                <Btn title="Inline code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
                    <PiCode size={18} />
                </Btn>

                <div className="mx-1 h-6 w-px bg-white/15" />

                {/* Headings */}
                <div className="relative">
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setHeadingOpen((v) => !v)}
                        className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm hover:bg-white/10 active:bg-white/15 ring-1 ring-white/10"
                    >
                        <span className="font-semibold">{currentHeadingLabel}</span>
                        <span className="text-xs opacity-70">▾</span>
                    </button>

                    {headingOpen && (
                        <div className="absolute left-0 z-50 mt-2 min-w-[190px] rounded-2xl bg-zinc-900/98 p-1 shadow-2xl ring-1 ring-white/10 backdrop-blur">
                            <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => setHeading(undefined)}
                                className={cx("flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-white/10", editor.isActive("paragraph") && "bg-white/10")}
                            >
                                <PiParagraph />
                                Paragraph
                            </button>
                            <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => setHeading(1)}
                                className={cx("flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-white/10", editor.isActive("heading", { level: 1 }) && "bg-white/10")}
                            >
                                <PiTextHOne />
                                Heading 1
                            </button>
                            <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => setHeading(2)}
                                className={cx("flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-white/10", editor.isActive("heading", { level: 2 }) && "bg-white/10")}
                            >
                                <PiTextHTwo />
                                Heading 2
                            </button>
                            <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => setHeading(3)}
                                className={cx("flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-white/10", editor.isActive("heading", { level: 3 }) && "bg-white/10")}
                            >
                                <PiTextHThree />
                                Heading 3
                            </button>
                        </div>
                    )}
                </div>

                {/* Lists + blocks */}
                <Btn title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
                    <PiListBullets size={18} />
                </Btn>

                <Btn title="Ordered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                    <PiListNumbers size={18} />
                </Btn>

                <Btn title="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
                    <PiQuotes size={18} />
                </Btn>

                <Btn title="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
                    <PiCodeBlock size={18} />
                </Btn>

                <div className="mx-1 h-6 w-px bg-white/15" />

                {/* Text color */}
                <div className="relative">
                    <Btn title="Text color" active={!!editor.getAttributes("textStyle")?.color} onClick={() => setColorOpen((v) => !v)}>
                        <PiPalette size={18} />
                    </Btn>

                    {colorOpen && (
                        <div
                            className={cx(
                                "absolute left-0 z-50 mt-2",
                                "rounded-2xl bg-zinc-900/98 p-3 shadow-2xl",
                                "ring-1 ring-white/10 backdrop-blur",
                                "min-w-[220px] w-max"
                            )}
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            <div className="flex items-center justify-between gap-3 pb-2">
                                <span className="text-xs text-white/70 whitespace-nowrap">Color</span>
                                <button type="button" onClick={clearColor} className="text-xs text-white/70 hover:text-white whitespace-nowrap shrink-0">
                                    Reset
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {COLOR_SWATCHES.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        title={c}
                                        onClick={() => applyColor(c)}
                                        className="h-5 w-5 rounded-full ring-1 ring-white/15 hover:ring-white/40 shrink-0"
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Link */}
                <Btn
                    title={editor.isActive("link") ? "Edit link" : "Add link"}
                    active={editor.isActive("link")}
                    onClick={() => {
                        setLinkValue(editor.getAttributes("link").href ?? "");
                        setLinkOpen((v) => !v);
                    }}
                >
                    <PiLinkSimple size={18} />
                </Btn>

                {linkOpen && (
                    <div className="ml-1 flex items-center gap-2 rounded-full bg-white/10 px-2 py-1 ring-1 ring-white/10" onMouseDown={(e) => e.preventDefault()}>
                        <input
                            value={linkValue}
                            onChange={(e) => setLinkValue(e.target.value)}
                            placeholder="https://example.com"
                            className="w-[240px] bg-transparent text-sm outline-none placeholder:text-white/50"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") setOrUnsetLink();
                                if (e.key === "Escape") setLinkOpen(false);
                            }}
                        />
                        <button type="button" title="Apply" onClick={setOrUnsetLink} className="rounded-full p-1 hover:bg-white/10">
                            <PiCheckBold size={16} />
                        </button>
                        {editor.isActive("link") && (
                            <button type="button" title="Remove link" onClick={unsetLink} className="rounded-full p-1 hover:bg-white/10">
                                <PiXBold size={16} />
                            </button>
                        )}
                    </div>
                )}
            </BubbleMenu>

            <EditorContent editor={editor} className="min-h-[500px]" />
        </div>
    );
}
