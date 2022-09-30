import React from "react";

export default class EditToolbar extends React.Component {
    render() {
        const { canAddSong, canUndo, canRedo, canClose, isModalOpen, addCallback,
            undoCallback, redoCallback, closeCallback } = this.props;
        let addSongClass = "toolbar-button";
        let undoClass = "toolbar-button";
        let redoClass = "toolbar-button";
        let closeClass = "toolbar-button";
        if (!canAddSong || isModalOpen) addSongClass += "-disabled";
        if (!canUndo || isModalOpen) undoClass += "-disabled";
        if (!canRedo || isModalOpen) redoClass += "-disabled";
        if (!canClose || isModalOpen) closeClass += "-disabled";
        return (
            <div id="edit-toolbar">
                <input
                    type="button"
                    id='add-song-button'
                    value="+"
                    className={addSongClass}
                    onClick={addCallback}
                    disabled={!canAddSong || isModalOpen}
                />
                <input
                    type="button"
                    id='undo-button'
                    value="⟲"
                    className={undoClass}
                    onClick={undoCallback}
                    disabled={!canUndo || isModalOpen}
                />
                <input
                    type="button"
                    id='redo-button'
                    value="⟳"
                    className={redoClass}
                    onClick={redoCallback}
                    disabled={!canRedo || isModalOpen}
                />
                <input
                    type="button"
                    id='close-button'
                    value="&#x2715;"
                    className={closeClass}
                    onClick={closeCallback}
                    disabled={!canClose || isModalOpen}
                />
            </div>
        )
    }
}