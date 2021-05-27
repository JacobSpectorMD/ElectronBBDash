<template>
  <v-container
    id="dashboard"
    fluid
    tag="section"
  >
    <base-material-card
      color="#364d5c"
    >
      <template
        v-slot:heading
        class="card-heading"
      >
        <div class="text-h3 font-weight-light">
          Settings
        </div>
        <div class="heading-buttons">
          <v-btn
            elevation="0"
            class="heading-button"
            @click="createNewDatabase"
          >
            <v-icon class="mr-2">
              mdi-database-plus
            </v-icon>
              Create Database
          </v-btn>
          <v-btn
            elevation="0"
            class="heading-button"
            @click="loadExistingDatabase"
          >
            <v-icon class="mr-2">
              mdi-folder-open
            </v-icon>
              Load Database
          </v-btn>
        </div>
      </template>
      <v-simple-table>
        <thead>
          <tr>
            <th class="primary--text">
              Active
            </th>
            <th class="primary--text">
              Location
            </th>
            <th class="primary--text">
              Remove
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="database in databases"
            :key="database.id"
          >
            <td
              v-if="database.selected"
            >
              <v-icon color="secondary">mdi-check-bold</v-icon>
            </td>
            <td v-else></td>
            <td>{{ database.location }}</td>
            <td>
              <v-icon
                color="secondary"
                @click="showDeleteDialog(database)"
              >
                mdi-trash-can-outline
              </v-icon>
            </td>
          </tr>
        </tbody>
      </v-simple-table>

    </base-material-card>

    <v-dialog
      v-model="deleteDialog"
      max-width="500"
    >
      <v-card class="delete-card">
        <div
          id="delete-x"
          @click="deleteDialog = false"
        >
          <v-icon
            color="white"
            large
          >mdi-alpha-x</v-icon>
        </div>
        <div>
          <div class="section-header">Remove Database</div>
          <div class="delete-text">Removing the database means that it will no longer show up on the list of databases. However, the actual
            database file will not be deleted.</div>
          <v-btn color="secondary">Remove Database</v-btn>
        </div>
        <div>
          <div class="section-header">Delete Database</div>
          <div class="delete-text">Deleting the database will delete the database file and remove it from the list of databases. Warning: All data in the
            database will be lost!</div>
          <v-btn
            color="primary"
            @click="showDeleteConfirmDialog"
          >Delete Database</v-btn>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="deleteConfirmDialog"
      max-width="500"
    >
      <v-card
        id="delete-confirm-card"
        class="delete-card"
      >
        <div class="mb-2">
          To delete this database, please enter (or copy + paste) the location of this database in the field below, then click Delete.
        </div>
        <div class="mb-2">
          <span class="font-weight-bold">Database Location:</span> {{ selectedDatabaseLocation }}
        </div>
        <v-text-field
          v-model="deleteConfirmText"
          outlined
        ></v-text-field>
        <div class="justify-end flex-row">
          <v-btn
            color="secondary"
          >Cancel</v-btn>
          <v-btn
            :disabled="!confirmTextMatches"
            color="primary"
          >Delete</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
  const db = require('../../../assets/js/database')
  const { dialog } = require('electron').remote
  // const fs = require('fs')

  export default {
    name: 'Settings.vue',
    data () {
      return {
        databases: [],
        deleteConfirmDialog: false,
        deleteConfirmText: null,
        deleteDialog: false,
        selectedDatabase: null,
      }
    },
    computed: {
      confirmTextMatches () {
        return this.deleteConfirmText === this.selectedDatabaseLocation
      },
      selectedDatabaseLocation () {
        console.log('updaint location')
        return (this.selectedDatabase) ? this.selectedDatabase.location : ''
      },
    },
    mounted () {
      this.getExistingDatabases()
    },
    methods: {
      createNewDatabase () {
        const cmp = this
        // const content = 'Some text to save into the file'

        dialog.showSaveDialog(null).then((result) => {
          if (result.filePath && result.filePath !== '') {
            db.createDatabase(result.filePath)
            console.log(cmp.$settingsDb)
            db.addDatabasePath(cmp.$settingsDbPath, result.filePath)
          }
        })
      },
      loadExistingDatabase () {
        const cmp = this
        dialog.showOpenDialog(null).then((result) => {
          result.filePaths.forEach(function (filePath) {
            db.addDatabasePath(cmp.$settingsDbPath, filePath)
          })
        })
        cmp.databases.length = 0
        cmp.getExistingDatabases()
      },
      getExistingDatabases () {
        // Gets the list of transfusion databases from the settingsDb
        const cmp = this
        db.getExistingDatabases(cmp.$settingsDbPath).then(function (databases) {
          databases.forEach(function (database) {
            cmp.databases.push(database)
          })
        })
      },
      showDeleteConfirmDialog () {
        this.deleteDialog = false
        this.deleteConfirmDialog = true
      },
      showDeleteDialog (database) {
        console.log(database)
        this.selectedDatabase = database
        this.deleteDialog = true
      },
      removeDatabase (databaseId) {
      },
    },
  }
</script>

<style scoped>
  /deep/ .text-start {
    display: flex;
    justify-content: space-between;
  }

  .heading-button {
    background-color: rgba(0, 0, 0, 0) !important;
  }

  .delete-card {
    padding: 16px;
    padding-top: 32px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .delete-card > div {
    display: flex;
    flex-direction: column;
  }

  .delete-card > div button {
    align-self: flex-end;
  }
  #delete-cancel {margin-top: 8px;}
  #delete-x {
    position: absolute;
    top: 0;
    right: 0;
    border-radius: 0px 0px 0px 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    cursor: pointer;
    background: #a20c3e;
  }
  .section-header {
    font-size: 16px;
    font-weight: 500;
    border-bottom: thin solid rgba(0, 0, 0, 0.54);
    margin-bottom: 8px;
  }

  #delete-confirm-card {
    font-size: 16px;
  }

  #confirm-buttons {
  }
</style>
