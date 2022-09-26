import React, {Component} from "react";

export default class DeleteSongModal extends Component {
    render() {
        const {closeCallback, deleteCallback } = this.props;
        return (
            <div 
            className="modal" 
                id="delete-song-modal" 
                data-animation="slideInOutLeft">
                    <div className="modal-root" id='verify-delete-song-root'>
                        <div className="modal-north">
                            Delete playlist?
                        </div>
                        <div className="modal-center">
                            <div className="modal-center-content">
                                Are you sure you wish to permanently remove <span id="delete-song-span"></span> from the playlist?
                            </div>
                        </div>
                        <div className="modal-south">
                            <input type="button" 
                                id="delete-song-confirm-button" 
                                className="modal-button" 
                                onClick={deleteCallback}
                                value='Confirm' />
                            <input type="button" 
                                id="delete-song-cancel-button" 
                                className="modal-button" 
                                onClick={closeCallback}
                                value='Cancel' />
                        </div>
                    </div>
            </div>
        )
    }
}
