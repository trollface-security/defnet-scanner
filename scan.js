const fs = require('fs')
const axios = require('axios')
const xdd = axios.create();
xdd.defaults.timeout = 6000;
const dbman = require('simple-json-db')
const db = new dbman('./working.db')
const data = fs.readFileSync("./scan.txt",'utf-8')
const pdata = data.split('\n')
function scan(ip,ports) {
  return new Promise(async(res,rej)=>{
      let portss = []
      let valid
      for (var port of ports) {
        await xdd.get('http://'+ip+':'+port)
          .then((r)=>{
            valid = true
            portss.push(port)
        })
        .catch(()=>{
      
        })
      }
    if (valid) {
      res(portss)
    }else{
      rej('e')
    }
  })
}
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
function percent(partialValue, totalValue) {
   return (100 * partialValue) / totalValue;
} 
//scan('45.76.18.205',[80,8080,90]).then(()=>{console.log("done")})
let i = 0;
let suc = 0
async function run() {
  for (var ip of pdata) {
    scan(ip.split('/')[0],[90,80,8080,9999])
    .then((ports)=>{
      i++
      suc++
      console.log(`success! currently: ${percent(i,pdata.length).toString()}% done. (${i}/${pdata.length})`)
        if (i>=pdata.length) {
          console.log("FINISHED! Successful finds:"+suc.toString()+' - That is : '+percent(suc,pdata.length).toString()+'% of '+pdata.length.toString()+' ips that are valid!')
      }
      db.set(ip.split('/')[0],ports)
    })
    .catch((e)=>{
      if (!e) return;
      i++
      if (i>=pdata.length) {
          console.log("FINISHED! Successful finds:"+suc.toString()+' - That is : '+percent(suc,pdata.length).toString()+'% of '+pdata.length.toString()+' ips that are valid!')
      return;
      }
      console.log(`currently: ${percent(i,pdata.length).toString()}% done. (${i}/${pdata.length})`)
    })
    await sleep(2)
  }
}
run()
