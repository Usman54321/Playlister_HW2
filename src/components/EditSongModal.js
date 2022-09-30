import React, { Component } from "react";

export default class EditSongModal extends Component {
    render() {
        const { closeCallback, editCallback } = this.props;
        return (
            <div
                className="modal"
                id="edit-song-modal"
                data-animation="slideInOutLeft">
                <div className="modal-root" id='verify-edit-song-root'>
                    <div className="modal-north">
                        Edit Song
                    </div>
                    <div className="modal-center">
                        <span>Title:</span>
                        <input type="text" id="eTitle" name="title" />
                        <span>Artist:</span>
                        <input type="text" id="eArtist" name="artist" />
                        <span>Youtube ID:</span>
                        <input type="text" id="eID" name="youtubeID" />
                        <br></br>
                    </div>
                    <div className="modal-south">
                        <input type="button"
                            id="edit-song-confirm-button"
                            className="modal-button"
                            onClick={editCallback}
                            value='Confirm' />
                        <input type="button"
                            id="edit-song-cancel-button"
                            className="modal-button"
                            onClick={closeCallback}
                            value='Cancel' />
                    </div>
                </div>
            </div>
        )
    }
}