new Vue({
    name: 'MainApp',
    el: "#app",
    data: {
        name: '',
        note: '',
        records: []
    },

    computed: {
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
                })


        }

    }
})