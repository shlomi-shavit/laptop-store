const fs = require('fs'); // File System module
const http = require('http'); // HTTP server
const url = require('url'); // routing

const json = fs.readFileSync(`${__dirname}/data/data.json`, 'utf-8'); // Read synchronous file from my folder, its sync beacuse its load only once when application start up
const laptopDate = JSON.parse(json); // return data.json as an object

const server = http.createServer((req, response) => {
    //console.log('Server access')
    const pathName = url.parse(req.url, true).pathname;
    console.log(pathName);
    const laptopId =  url.parse(req.url, true).query.id;

    // Product page
    if(pathName === '/products' || pathName === '/'){
        response.writeHead(200, { 'Content-type': 'text/html'});
        fs.readFile(`${__dirname}/templates/template-products.html`, 'utf-8', (err, data) => {

            // data / productsOutput = template-products.html
            let productsOutput = data; // = template-products.html

            fs.readFile(`${__dirname}/templates/template-all-laptops.html`, 'utf-8', (err, data) => {

                // data = template-all-laptops.html
                // laptopDate = data.json as an obj

                const laptopsOutput = laptopDate.map(el => replaceTemplate(data, el)).join('');
                // laptopsOutput = template-all-laptops.html after replacing placeholders with laptopDate obj and parse it to string

                // replace %LAPTOPS% in template-products.html page with laptopsOutput(string)
                productsOutput = productsOutput.replace('{%LAPTOPS%}', laptopsOutput);

                // return template-products.html with the new laptopOutput
                response.end(productsOutput);
            });

        });
    }

    // Laptop page
    else if(pathName === '/laptop' && laptopId < laptopDate.length){
        response.writeHead(200, { 'Content-type': 'text/html'});

        fs.readFile(`${__dirname}/templates/template-laptop.html`, 'utf-8', (err, data) => { // readFile is not sync, need to check what is the differences
            // laptop item
            const laptop = laptopDate[laptopId];
            const output = replaceTemplate(data, laptop)
            response.end(output);
        });
    }

    // IMAGES
    else if((/\.(jpg|jpeg|png|gif)$/i).test(pathName)){
        fs.readFile(`${__dirname}/data/img${pathName}`, (err, data) => {
            response.writeHead(200, { 'Content-type': 'image/jpg'});
            response.end(data);
        })
    }

    // 404 page
    else {
        response.writeHead(400, { 'Content-type': 'text/html'});

        fs.readFile(`${__dirname}/templates/template-404.html`, 'utf-8', (err, data) => {
            let output = data; // = template-404.html

            fs.readFile(`${__dirname}/data/img/404-Page.png`, (err, data) => {

                let img404 = `404-Page.png`;

                output = output.replace('{%404IMG%}', img404);
                response.end(output);
            })

        });
    }
});

server.listen(1337, '127.0.0.1', () => {
    console.log('Listing for requests now');
    //console.log(url);
});

function replaceTemplate(originalHtml, laptop){
    let output = originalHtml.replace(/{%PRODUCTNAME%}/g, laptop.productName);
        output = output.replace(/{%IMAGE%}/g, laptop.image);
        output = output.replace(/{%PRICE%}/g, laptop.price);
        output = output.replace(/{%SCREEN%}/g, laptop.screen);
        output = output.replace(/{%CPU%}/g, laptop.cpu);
        output = output.replace(/{%STORAGE%}/g, laptop.storage);
        output = output.replace(/{%RAM%}/g, laptop.ram);
        output = output.replace(/{%DESCRIPTION%}/g, laptop.description);
        output = output.replace(/{%ID%}/g, laptop.id);
    return output;
};