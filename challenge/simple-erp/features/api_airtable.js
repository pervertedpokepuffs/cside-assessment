import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

const api_url = process.env.GATSBY_API_URL

const baseInterface = {
    convertObject(data) {
        return {
            id: data.id,
            ...data.fields
        }
    },

    handleFetch(res) {
        return {
            ...res.data,
            records: res.data.records.map(el => this.convertObject(el))
        }
    },

    handleCreate(data) { return data }
}

class AirtableApi {
    constructor(table_name, table_interface = baseInterface) {
        this.tableName = table_name
        this.tableInterface = table_interface
    }

    fetch(offset = null) {
        const options = offset != null
            ? { params: { offset: offset } }
            : undefined
        return axios.get(`${api_url}/${this.tableName}`, options)
            .then(el => this.tableInterface.handleFetch(el))
    }

    find(id) {
        return axios.get(`${api_url}/${this.tableName}/${id}`)
            .then(el => this.tableInterface.convertObject(el))
    }

    create(data) {
        data = this.tableInterface.handleCreate(data)
        return axios.post(`${api_url}/${this.tableName}`, { records: [{ fields: data }] })
            .then(el => this.tableInterface.convertObject(el))
    }

    update(id, data) {
        return axios.post(`${api_url}/${this.tableName}/${id}`, { fields: data })
            .then(el => this.tableInterface.convertObject(el))
    }

    delete(id) {
        return axios.delete(`${api_url}/${this.tableName}/${id}`)
            .then(res => res.data.deleted)
    }
}

const PurchaseOrderInterface = {
    ...baseInterface,

    /**
     * @param {string[]} itemsIds_arr 
     * @returns {Object}
     */
    handleCreate(itemsIds_arr) {
        if (itemsIds_arr?.constructor !== Array) throw new Error('Input must be an array.')
        return {
            uuid: uuidv4(),
            status: 'pending_approval',
            item: itemsIds_arr,
        }
    }
}

const PurchaseOrderApi = new AirtableApi('purchase_orders', PurchaseOrderInterface)
const ItemsApi = new AirtableApi('items')

export {
    PurchaseOrderApi,
    ItemsApi
}
