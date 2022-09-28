import React from "react";

export default class SidebarHeading extends React.Component {
    handleClick = (event) => {
        let createNewListCallback = this.props.createNewListCallback;
        createNewListCallback();
    };
    render() {
        let className = "toolbar-button";
        if (!this.props.canCreateNewList)
            className += "-disabled";
        return (
            <div id="sidebar-heading">
                <input
                    type="button"
                    id="add-list-button"
                    className={className}
                    onClick={this.handleClick}
                    value="+" />
                Your Playlists
            </div>
        );
    }
}