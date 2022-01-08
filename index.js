const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
let items = [];
const makeid = (length) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}
const postImage = async (id, imgUrl) => {
    var data = new FormData();
    var UUid = makeid(40);
    data.append('file', fs.createReadStream(imgUrl));
    data.append('request', `{"idempotency_key": "${UUid}","image": {"id": "#${UUid}", "type": "IMAGE","image_data": {"caption": "asdf"}},"object_id": "${id}"}`);

    var config = {
        method: 'post',
        url: 'https://connect.squareup.com/v2/catalog/images',
        headers: {
            'Square-Version': '2021-12-15',
            'Authorization': 'Bearer EAAAEGBUe1rvfT3PqNyJinn3qO46tnnUbKxsbdJtbKpKw9t9cExGQ_3yG7SFAK0T',
            'Accept': 'application/json',
            ...data.getHeaders()
        },
        data: data
    };
    // console.log(config);
    await axios(config)
        .then(function (response) {
            console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {

            console.log(error);
        });
}
const getItems = (xlData) => {
    const config = {
        method: 'get',
        url: 'https://connect.squareup.com/v2/catalog/list?types=item',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Authorization': 'Bearer EAAAEGBUe1rvfT3PqNyJinn3qO46tnnUbKxsbdJtbKpKw9t9cExGQ_3yG7SFAK0T'
        }
    };
    axios(config)
        .then((resp) => {
            items = resp.data.objects;
            xlData.forEach(cell => {
                const filterItem = items.filter(item => cell.SKU === item.item_data.variations[0].item_variation_data.sku);
                postImage(filterItem[0].id, cell.image_URL);
            })
        })
        .catch((err) => {
            console.log(err);
        });
}

const excelToJson = () => {
    var workbook = XLSX.readFile('E:/WorkFlow/node/assets/DebrasDoodads_TestFile1.xlsx');
    var sheet_name_list = workbook.SheetNames;
    var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    getItems(xlData)
}

const main = () => {
    excelToJson()
}
main();
