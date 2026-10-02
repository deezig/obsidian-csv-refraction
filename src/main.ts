import { Plugin, TextFileView, WorkspaceLeaf } from 'obsidian';
import { EditorView, ViewUpdate, ViewPlugin, Decoration, DecorationSet, PluginValue } from "@codemirror/view";
import { EditorState, RangeSetBuilder } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { keymap } from "@codemirror/view";

export const VIEW_TYPE_CSV = "csv-view";

// --- RAINBOW CSV LOGIC ---
class RainbowCsvPlugin implements PluginValue {
    decorations: DecorationSet;

    constructor(view: EditorView) {
        this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
            this.decorations = this.buildDecorations(update.view);
        }
    }

    buildDecorations(view: EditorView): DecorationSet {
        const builder = new RangeSetBuilder<Decoration>();
        const doc = view.state.doc;

        for (let { from, to } of view.visibleRanges) {
            const text = doc.sliceString(from, to);
            const lines = text.split("\n");
            let currentPos = from;

            lines.forEach(line => {
                const columns = line.split(","); 
                columns.forEach((col, index) => {
                    const colorClass = `csv-color-${index % 8}`;
                    
                    // Prevent empty decorations which CodeMirror dislikes
                    if (col.length > 0) {
                        const deco = Decoration.mark({ class: colorClass });
                        builder.add(currentPos, currentPos + col.length, deco);
                    }
                    currentPos += col.length + 1;
                });
            });
        }
        return builder.finish();
    }
}

const rainbowCsvExtension = ViewPlugin.fromClass(RainbowCsvPlugin, {
    decorations: (value: RainbowCsvPlugin) => value.decorations
});


// --- OBSIDIAN VIEW ---
class CsvView extends TextFileView {
    editor!: EditorView | null;
    currentMode: 'source' | 'table' = 'source';
    isTableEditMode: boolean = false;

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
        
        this.addAction("table", "Toggle view (Source / Table)", () => {
            this.currentMode = this.currentMode === 'source' ? 'table' : 'source';
            this.renderCurrentMode();
        });
    }

    getViewType() { return VIEW_TYPE_CSV; }
    getDisplayText() { return this.file ? this.file.name : "CSV View"; }
    getViewData() { return this.data; }

    setViewData(data: string, clear: boolean) {
        this.data = data;
        this.renderCurrentMode();
    }

    renderCurrentMode() {
        this.contentEl.empty();
        
        if (this.editor) {
            this.editor.destroy();
            this.editor = null;
        }

        if (this.currentMode === 'source') {
            this.renderSourceMode();
        } else {
            this.renderTableMode();
        }
    }

    renderSourceMode() {
        this.editor = new EditorView({
            state: EditorState.create({
                doc: this.data,
                extensions: [
                    history(),
                    keymap.of([...defaultKeymap, ...historyKeymap]),
                    rainbowCsvExtension,
                    EditorView.lineWrapping,
                    EditorView.updateListener.of((update: ViewUpdate) => {
                        if (update.docChanged) {
                            this.data = update.state.doc.toString();
                            this.requestSave(); 
                        }
                    })
                ]
            }),
            parent: this.contentEl
        });
    }

    renderTableMode() {
        // Toolbar & Read/Edit toggle
        const toolbarEl = this.contentEl.createDiv({ cls: "csv-table-toolbar" });
        const editToggleBtn = toolbarEl.createEl("button", {
            text: this.isTableEditMode ? "Read mode" : "Edit cells",
            cls: "mod-cta"
        });

        editToggleBtn.onclick = () => {
            this.isTableEditMode = !this.isTableEditMode;
            this.renderCurrentMode(); 
        };

        // Table structure
        const tableContainer = this.contentEl.createDiv({ cls: "csv-table-container" });
        const tableEl = tableContainer.createEl("table", { cls: "csv-table" });
        
        const rows = this.data.split("\n");
        
        rows.forEach((line, rowIndex) => {
            const tr = tableEl.createEl("tr");
            const cols = line.split(",");
            
            cols.forEach((col, colIndex) => {
                const td = tr.createEl("td");
                
                if (this.isTableEditMode) {
                    const input = td.createEl("input", {
                        type: "text",
                        value: col,
                        cls: "csv-cell-input"
                    });
                    
                    input.onchange = (e) => {
                        const target = e.target as HTMLInputElement;
                        cols[colIndex] = target.value;
                        rows[rowIndex] = cols.join(",");
                        
                        this.data = rows.join("\n");
                        this.requestSave();
                    };
                } else {
                    td.setText(col);
                }
            });
        });
    }

    clear() {
        this.data = "";
        this.contentEl.empty();
        if (this.editor) {
            this.editor.destroy();
            this.editor = null;
        }
    }

    async onClose() {
        if (this.editor) this.editor.destroy();
    }
}

export default class CsvRefractionPlugin extends Plugin {
    async onload() {
        this.registerView(VIEW_TYPE_CSV, (leaf) => new CsvView(leaf));
        this.registerExtensions(["csv"], VIEW_TYPE_CSV);
    }
}
