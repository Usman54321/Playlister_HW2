import React from 'react';
import './App.css';

// IMPORT DATA MANAGEMENT AND TRANSACTION STUFF
import DBManager from './db/DBManager';
import jsTPS from './common/jsTPS.js';

// OUR TRANSACTIONS
import MoveSong_Transaction from './transactions/MoveSong_Transaction.js';
import AddSong_Transaction from './transactions/AddSong_Transaction.js';
import DeleteSong_Transaction from './transactions/DeleteSong_Transaction.js';
import EditSong_Transaction from './transactions/EditSong_Transaction.js';

// THESE REACT COMPONENTS ARE MODALS
import DeleteListModal from './components/DeleteListModal.js';
import DeleteSongModal from './components/DeleteSongModal.js';
import EditSongModal from './components/EditSongModal';

// THESE REACT COMPONENTS ARE IN OUR UI
import Banner from './components/Banner.js';
import EditToolbar from './components/EditToolbar.js';
import PlaylistCards from './components/PlaylistCards.js';
import SidebarHeading from './components/SidebarHeading.js';
import SidebarList from './components/SidebarList.js';
import Statusbar from './components/Statusbar.js';


class App extends React.Component {
    constructor(props) {
        super(props);

        // THIS IS OUR TRANSACTION PROCESSING SYSTEM
        this.tps = new jsTPS();

        // THIS WILL TALK TO LOCAL STORAGE
        this.db = new DBManager();

        // GET THE SESSION DATA FROM OUR DATA MANAGER
        let loadedSessionData = this.db.queryGetSessionData();

        // SETUP THE INITIAL STATE
        this.state = {
            listKeyPairMarkedForDeletion: null,
            songMarkedForDeletion: null,
            songMarkedForEdit: null,
            currentList: null,
            sessionData: loadedSessionData,
            undoPossible: false,
            redoPossible: false,
            addPossible: false,
            hasModalOpen: false
        }
    }
    sortKeyNamePairsByName = (keyNamePairs) => {
        keyNamePairs.sort((keyPair1, keyPair2) => {
            // GET THE LISTS
            return keyPair1.name.localeCompare(keyPair2.name);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CREATING A NEW LIST
    createNewList = () => {
        // FIRST FIGURE OUT WHAT THE NEW LIST'S KEY AND NAME WILL BE
        let newKey = this.state.sessionData.nextKey;
        let newName = "Untitled" + newKey;

        // MAKE THE NEW LIST
        let newList = {
            key: newKey,
            name: newName,
            songs: []
        };

        // MAKE THE KEY,NAME OBJECT SO WE CAN KEEP IT IN OUR
        // SESSION DATA SO IT WILL BE IN OUR LIST OF LISTS
        let newKeyNamePair = { "key": newKey, "name": newName };
        let updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
        this.sortKeyNamePairsByName(updatedPairs);

        // CHANGE THE APP STATE SO THAT THE CURRENT LIST IS
        // THIS NEW LIST AND UPDATE THE SESSION DATA SO THAT THE
        // NEXT LIST CAN BE MADE AS WELL. NOTE, THIS setState WILL
        // FORCE A CALL TO render, BUT THIS UPDATE IS ASYNCHRONOUS,
        // SO ANY AFTER EFFECTS THAT NEED TO USE THIS UPDATED STATE
        // SHOULD BE DONE VIA ITS CALLBACK
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion: prevState.listKeyPairMarkedForDeletion,
            songMarkedForDeletion: prevState.songMarkedForDeletion,
            songMarkedForEdit: prevState.songMarkedForEdit,
            currentList: newList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey + 1,
                counter: prevState.sessionData.counter + 1,
                keyNamePairs: updatedPairs
            },
        }), () => {
            // PUTTING THIS NEW LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationCreateList(newList);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF DELETING A LIST.
    deleteList = (key) => {
        // IF IT IS THE CURRENT LIST, CHANGE THAT
        let newCurrentList = null;
        if (this.state.currentList) {
            if (this.state.currentList.key !== key) {
                // THIS JUST MEANS IT'S NOT THE CURRENT LIST BEING
                // DELETED SO WE'LL KEEP THE CURRENT LIST AS IT IS
                newCurrentList = this.state.currentList;
            }
        }

        let keyIndex = this.state.sessionData.keyNamePairs.findIndex((keyNamePair) => {
            return (keyNamePair.key === key);
        });
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        if (keyIndex >= 0)
            newKeyNamePairs.splice(keyIndex, 1);

        // AND FROM OUR APP STATE
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion: null,
            songMarkedForDeletion: null,
            songMarkedForEdit: null,
            currentList: newCurrentList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter - 1,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            // DELETING THE LIST FROM PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationDeleteList(key);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    deleteMarkedList = () => {
        this.deleteList(this.state.listKeyPairMarkedForDeletion.key);
        this.hideDeleteListModal();
    }
    // THIS FUNCTION SPECIFICALLY DELETES THE CURRENT LIST
    deleteCurrentList = () => {
        if (this.state.currentList) {
            this.deleteList(this.state.currentList.key);
        }
    }
    renameList = (key, newName) => {
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        // NOW GO THROUGH THE ARRAY AND FIND THE ONE TO RENAME
        for (let i = 0; i < newKeyNamePairs.length; i++) {
            let pair = newKeyNamePairs[i];
            if (pair.key === key) {
                pair.name = newName;
            }
        }
        this.sortKeyNamePairsByName(newKeyNamePairs);

        // WE MAY HAVE TO RENAME THE currentList
        let currentList = this.state.currentList;
        if (currentList.key === key) {
            currentList.name = newName;
        }

        this.setState(prevState => ({
            listKeyPairMarkedForDeletion: null,
            songMarkedForDeletion: null,
            songMarkedForEdit: null,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            let list = this.db.queryGetList(key);
            list.name = newName;
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF LOADING A LIST FOR EDITING
    loadList = (key) => {
        let newCurrentList = this.db.queryGetList(key);
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion: prevState.listKeyPairMarkedForDeletion,
            songMarkedForDeletion: prevState.songMarkedForDeletion,
            songMarkedForEdit: prevState.songMarkedForEdit,
            currentList: newCurrentList,
            sessionData: this.state.sessionData
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            this.tps.clearAllTransactions();
            this.updateToolbarButtons();
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CLOSING THE CURRENT LIST
    closeCurrentList = () => {
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion: prevState.listKeyPairMarkedForDeletion,
            songMarkedForDeletion: prevState.songMarkedForDeletion,
            songMarkedForEdit: prevState.songMarkedForEdit,
            currentList: null,
            sessionData: this.state.sessionData
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            this.tps.clearAllTransactions();
            this.updateToolbarButtons();
        });
    }
    setStateWithUpdatedList(list) {
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion: prevState.listKeyPairMarkedForDeletion,
            songMarkedForDeletion: prevState.songMarkedForDeletion,
            songMarkedForEdit: prevState.songMarkedForEdit,
            currentList: list,
            sessionData: this.state.sessionData
        }), () => {
            // UPDATING THE LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationUpdateList(this.state.currentList);
            this.updateToolbarButtons();
        });
    }
    getPlaylistSize = () => {
        return this.state.currentList.songs.length;
    }
    // THIS FUNCTION MOVES A SONG IN THE CURRENT LIST FROM
    // start TO end AND ADJUSTS ALL OTHER ITEMS ACCORDINGLY
    moveSong(start, end) {
        let list = this.state.currentList;

        // WE NEED TO UPDATE THE STATE FOR THE APP
        start -= 1;
        end -= 1;
        if (start < end) {
            let temp = list.songs[start];
            for (let i = start; i < end; i++) {
                list.songs[i] = list.songs[i + 1];
            }
            list.songs[end] = temp;
        }
        else if (start > end) {
            let temp = list.songs[start];
            for (let i = start; i > end; i--) {
                list.songs[i] = list.songs[i - 1];
            }
            list.songs[end] = temp;
        }
        this.setStateWithUpdatedList(list);
    }
    // THIS FUNCTION ADDS A MoveSong_Transaction TO THE TRANSACTION STACK
    addMoveSongTransaction = (start, end) => {
        let transaction = new MoveSong_Transaction(this, start, end);
        this.tps.addTransaction(transaction);
    }
    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING AN UNDO
    undo = () => {
        if (this.tps.hasTransactionToUndo()) {
            this.tps.undoTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.db.mutationUpdateList(this.state.currentList);
            this.updateToolbarButtons();
        }
    }
    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING A REDO
    redo = () => {
        if (this.tps.hasTransactionToRedo()) {
            this.tps.doTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.db.mutationUpdateList(this.state.currentList);
            this.updateToolbarButtons();
        }
    }

    markListForDeletion = (keyPair) => {
        this.setState(prevState => ({
            currentList: prevState.currentList,
            songMarkedForDeletion: prevState.songMarkedForDeletion,
            songMarkedForEdit: prevState.songMarkedForEdit,
            listKeyPairMarkedForDeletion: keyPair,
            sessionData: prevState.sessionData
        }), () => {
            // PROMPT THE USER
            this.showDeleteListModal();
        });
    }

    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE LIST
    showDeleteListModal = () => {
        let modal = document.getElementById("delete-list-modal");
        modal.classList.add("is-visible");
        this.setState(() => ({
            hasModalOpen: true
        }))
    }
    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideDeleteListModal = () => {
        let modal = document.getElementById("delete-list-modal");
        modal.classList.remove("is-visible");
        this.setState(() => ({
            hasModalOpen: false
        }))
    }

    showDeleteSongModal = () => {
        let modal = document.getElementById("delete-song-modal");
        modal.classList.add("is-visible");
        this.setState(() => ({
            hasModalOpen: true
        }))
    }

    hideDeleteSongModal = () => {
        let modal = document.getElementById("delete-song-modal");
        modal.classList.remove("is-visible");
        this.setState(() => ({
            hasModalOpen: false
        }))
    }

    addSong = () => {
        let list = this.state.currentList;
        if (list) {
            let newSong = { title: "Untitled", artist: "Unknown", youTubeId: "dQw4w9WgXcQ" };
            list.songs.push(newSong);
            this.setStateWithUpdatedList(list);
            let newLastIndex = list.songs.length - 1;
            return newLastIndex;
        }
    }

    addSpecificSong = (song, id) => {
        let list = this.state.currentList;
        if (list) {
            // add the song to the list at the id index
            list.songs.splice(id, 0, song);
            this.setStateWithUpdatedList(list);
        }
    }

    addSongTransaction = () => {
        let transaction = new AddSong_Transaction(this);
        this.tps.addTransaction(transaction);
        this.updateToolbarButtons();
    }

    deleteSongTransaction = () => {
        let id = this.state.songMarkedForDeletion;
        let transaction = new DeleteSong_Transaction(this, id);
        this.tps.addTransaction(transaction);
        this.updateToolbarButtons();
    }

    editSongTransaction = () => {
        let id = this.state.songMarkedForEdit;
        let title = document.querySelector("#eTitle").value;
        let artist = document.querySelector("#eArtist").value;
        let youTubeId = document.querySelector("#eID").value;
        let newSong = { title: title, artist: artist, youTubeId: youTubeId };
        let transaction = new EditSong_Transaction(this, id, newSong);
        this.tps.addTransaction(transaction);
        this.updateToolbarButtons();
    }

    deleteSpecificSong = (id) => {
        let list = this.state.currentList;
        if (list) {
            list.songs.splice(id, 1);
            this.setStateWithUpdatedList(list);
        }
    }

    deleteSong = () => {
        let list = this.state.currentList;
        let id = this.state.songMarkedForDeletion;

        if (list) {
            // get the song at the id index and remove it
            let song = list.songs[id];
            list.songs.splice(id, 1);
            this.setStateWithUpdatedList(list);
            this.hideDeleteSongModal();
            return song;
        }
        this.hideDeleteSongModal();
    }

    editSong = (id, newSong) => {
        let list = this.state.currentList;
        if (list) {
            // get the song at the id index and change it to newSong
            console.log("Changing song at index " + id + " to " + newSong.title + " by " + newSong.artist + " with id " + newSong.youTubeId + ".")
            list.songs[id] = newSong;
            this.setStateWithUpdatedList(list);
        }
        this.hideEditSongModal();
    }

    markSongForDeletion = (num) => {
        this.setState(prevState => ({
            currentList: prevState.currentList,
            songMarkedForDeletion: num,
            songMarkedForEdit: prevState.songMarkedForEdit,
            sessionData: prevState.sessionData
        }), () => {
            // PROMPT THE USER
            // get the song's name
            let song = this.state.currentList.songs[num];
            let name = song.title;
            document.getElementById("delete-song-span").innerHTML = name;
            this.showDeleteSongModal();
        });
    }

    markSongForEdit = (num) => {
        this.setState(prevState => ({
            currentList: prevState.currentList,
            songMarkedForDeletion: prevState.songMarkedForDeletion,
            songMarkedForEdit: num,
            sessionData: prevState.sessionData,
        }), () => {
            // PROMPT THE USER
            let song = this.state.currentList.songs[num];
            document.getElementById("eTitle").value = song.title;
            document.getElementById("eArtist").value = song.artist;
            document.getElementById("eID").value = song.youTubeId;
            this.showEditSongModal();
        });
    }

    showEditSongModal = () => {
        let modal = document.getElementById("edit-song-modal");
        modal.classList.add("is-visible");
        this.setState(() => ({
            hasModalOpen: true
        }))
    }

    hideEditSongModal = () => {
        let modal = document.getElementById("edit-song-modal");
        modal.classList.remove("is-visible");
        document.getElementById("eTitle").value = "";
        document.getElementById("eArtist").value = "";
        document.getElementById("eID").value = "";
        this.setState(() => ({
            hasModalOpen: false
        }))
    }

    updateToolbarButtons = () => {
        this.setState(prevState => ({
            currentList: prevState.currentList,
            songMarkedForDeletion: prevState.songMarkedForDeletion,
            songMarkedForEdit: prevState.songMarkedForEdit,
            sessionData: prevState.sessionData,
            undoPossible: this.tps.hasTransactionToUndo(),
            redoPossible: this.tps.hasTransactionToRedo(),
            addPossible: this.state.currentList !== null
        }));
    }

    handleKeyPress = (e) => {
        if (e.key === "z" && e.ctrlKey) {
            if (!this.state.hasModalOpen)
                this.undo();
            //Both undo and redo call updateToolbarButtons() so we don't need to call it here
        } else if (e.key === "y" && e.ctrlKey) {
            if (!this.state.hasModalOpen)
                this.redo();
        }
    }

    // Since app is not being unmounted, I don't think we need a componentWillUnmount() method
    componentDidMount() {
        document.addEventListener("keydown", this.handleKeyPress, false);
    }

    render() {
        return (
            <React.Fragment>
                <Banner />
                <SidebarHeading
                    createNewListCallback={this.createNewList}
                    canCreateNewList={!this.state.addPossible}
                    isModalOpen={this.state.hasModalOpen}
                />
                <SidebarList
                    currentList={this.state.currentList}
                    keyNamePairs={this.state.sessionData.keyNamePairs}
                    deleteListCallback={this.markListForDeletion}
                    loadListCallback={this.loadList}
                    renameListCallback={this.renameList}
                />
                <EditToolbar
                    canAddSong={this.state.addPossible}
                    canUndo={this.state.undoPossible}
                    canRedo={this.state.redoPossible}
                    canClose={this.state.addPossible}
                    isModalOpen={this.state.hasModalOpen}
                    undoCallback={this.undo}
                    redoCallback={this.redo}
                    closeCallback={this.closeCurrentList}
                    addCallback={this.addSongTransaction}
                />
                <PlaylistCards
                    currentList={this.state.currentList}
                    moveSongCallback={this.addMoveSongTransaction}
                    deleteSongCallback={this.markSongForDeletion}
                    editSongCallback={this.markSongForEdit} />
                <Statusbar
                    currentList={this.state.currentList} />
                <DeleteListModal
                    listKeyPair={this.state.listKeyPairMarkedForDeletion}
                    hideDeleteListModalCallback={this.hideDeleteListModal}
                    deleteListCallback={this.deleteMarkedList}
                />
                <DeleteSongModal
                    closeCallback={this.hideDeleteSongModal}
                    deleteCallback={this.deleteSongTransaction}
                />
                <EditSongModal
                    closeCallback={this.hideEditSongModal}
                    editCallback={this.editSongTransaction}
                />
            </React.Fragment>
        );
    }
}

export default App;
