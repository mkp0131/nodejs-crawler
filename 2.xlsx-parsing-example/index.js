var XLSX = require("xlsx");
var axios = require("axios");
var cheerio = require("cheerio");


var workbook = XLSX.readFile('./xlsx/data.xlsx');

const ws = workbook.Sheets.시트1;

const records = XLSX.utils.sheet_to_json(ws);

// for (const [i, r] of records.entries()) {
//   console.log(r.제목);
//   console.log(r.링크);
// }

const crawler = async () => {
  await Promise.all(records.map( async (r) => {
    const response = await axios.get(r.링크);
    if (response.status === 200) {
      const html = response.data;
      const $ = cheerio.load(html);
      const txt = $('.score_left .star_score').text().trim();
      console.log(txt);
    }
  }))
}

crawler();
