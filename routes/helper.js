var moment = require('moment');

function getMenuPositionArr() {
    return [
        {"id": "top", "name": "Top Menu"},
        {"id": "main", "name": "Main Menu"}
    ]
}
function getAdvertisementSize() {
    return [
        {"id": "300,300", "name": "300 * 300"},
        {"id": "728,90", "name": "728 * 90"}
    ]
}
function changeDateFormate(date, givenFormate, returnFormate) {
    return moment(date, givenFormate).format(returnFormate);
}
function truncateString(string, start, end) {
    return (string.length > end) ? string.substr(start, end) + '...': string.substr(start, end);
}
function html(key) {
    return "<div class='form-group'><label>Email address</label><input type='email' class='form-control' id='' placeholder='Enter email'></div>";
    //function body
}
module.exports = {
    getMenuPositionArr,
    getAdvertisementSize,
    changeDateFormate,
    truncateString,
    html
}