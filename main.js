new Vue({
    name: 'MainApp',
    el: "#app",
    data: {
        name: '',
        note: '',
        records: []
    },

    computed: {
        memorizedRecords() {
            return this.records.filter((record) => {
                return record.fields.Memorized
            })
        },
        unMemorized() {
            return this.records.filter((record) => {
                return !record.fields.Memorized
            })
        }
    },
    created() {
        axios.get(`https://api.airtable.com/v0/appgyWdA8yP0KXZr4/My%20Study%20Cards?maxRecords=20&view=Main%20View&api_key=${airtableKey}`)
            .then((resp) => {
                console.log('response', resp)
                this.records = resp.data.records
            })
    },
    methods: {
        view(recordID) {

            axios.get(`https://api.airtable.com/v0/appgyWdA8yP0KXZr4/My%20Study%20Cards/${recordID}?api_key=${airtableKey}`)
                .then((resp) => {
                    console.log('resp', resp)
                })
        },
        save() {

            // return early if either of the required fields are empty
            if (!this.name || !this.note) {
                return
            }

            const fields = {
                Name: this.name,
                Notes: this.note,
                // Memorized: false,
                Attachments: []
            }

            axios.post(`https://api.airtable.com/v0/appgyWdA8yP0KXZr4/My%20Study%20Cards?api_key=${airtableKey}`, {
                    fields
                })
                .then((resp) => {
                    console.log('response', resp)

                    /**
                     * Let's add this to our list of unMemorized tasks.
                     * Because our list is a computed property, we only
                     * need to update the data prop, this.records, and
                     * the computed property will automatically update.
                     */
                    this.records.push(resp.data)

                    /**
                     * And then we should clear the inputs so a user
                     * won't create too many of one task.
                     */
                    this.name = ''
                    this.note = ''

                    /**
                     * Unfortunately, we have to manually 
                     * remove the 'is-dirty' class from
                     * the inputs since Material Design Lite
                     * doesn't seem to reacted to our resetting
                     * this.name and this.note. 
                     */
                    document.getElementById('recordNameInput').classList.remove('is-dirty')
                    document.getElementById('recordNoteInput').classList.remove('is-dirty')
                })
        },
        setToMemorized(record) {

            console.log("Memorizing this record", record)

            const payload = {
                fields: record.fields
            }

            // payload.fields.Memorized = true 

            axios.put(`https://api.airtable.com/v0/appgyWdA8yP0KXZr4/My%20Study%20Cards/${record.id}?api_key=${airtableKey}`, payload)
                .then((resp) => {
                    console.log('updated the record', resp)

                    this.records = this.records.map((record) => {
                        if (resp.data.id === record.id) {
                            record = resp.data
                        }

                        return record
                    })
                })
        }

    }
})