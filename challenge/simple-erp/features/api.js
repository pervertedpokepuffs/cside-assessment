import axios from 'axios'

const MethodNotImplemented = () => { throw Error('Method not implemented.') }

const baseApi = {
    fetch: MethodNotImplemented,
    find: url => axios.get(url).then(res => res.data),
    create: MethodNotImplemented,
    update: MethodNotImplemented,
    delete: MethodNotImplemented,
}

const InventoryLotApi = {
    ...baseApi,
    create: (data) => axios.post(`${process.env.GATSBY_API_URL}/inventory-lots/`, data)
        .then(res => res.data)
        .then(res => {
            alert('Successfully added.')
            return res
        }, () => alert('Something went wrong.'))
}

const ItemsApi = {
    ...baseApi,
    fetch: () => axios.get(`${process.env.GATSBY_API_URL}/items/`)
        .then(res => res.data)
}

const PurchaseOrderApi = {
    ...baseApi,
    /**
     * Fetch purchase order.
     * @param {number} page_size 
     * @param {string} url
     * @returns 
     */
    fetch: (page_size = 25, url = null) => {
        let req = null
        if (url == null) req = axios.get(`${process.env.GATSBY_API_URL}/purchase-orders/`, {
            params: {
                limit: page_size
            }
        })
        else req = axios.get(url)
        return req
            .then(res => res.data)
            .then(res => {
                res = {
                    ...res,
                    results: res.results.map((el, idx) => ({ ...el, id: idx }))
                }
                return res
            })
    },
    /**
     * Create a new purchase order.
     * @param {{[string]: number}[]} item_quantity_arr - Item url and quantity key-value pair.
     */
    create: (item_quantity_arr) => {
        let data = {
            items: []
        }
        item_quantity_arr.forEach(el => {
            data.items.push({ item: Object.keys(el).pop(), quantity: Object.values(el).pop() })
        })

        return axios.post(`${process.env.GATSBY_API_URL}/purchase-orders/`, data)
            .then(res => res.data)
            .then(res => {
                alert('Successfully added.')
                return res
            }, () => alert('Something went wrong.'))
    },
    approve: url => axios.get(`${url}approve_order/`)
        .then(res => res.data),
    reject: url => axios.get(`${url}reject_order/`)
        .then(res => res.data)
}

export {
    ItemsApi,
    PurchaseOrderApi,
    InventoryLotApi,
}