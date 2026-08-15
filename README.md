# dynamic_waam_application

1.	INSTALL NODE.JS v24.19.00
2.	Clone the repository @ https://github.com/mikespecs/dynamic_waam_application 
-	run git clone https://github.com/mikespecs/dynamic_waam_application.git

3.	In the root directory ‘/dynamic_waam_application/’ run npm start which will initiate npm install to retrieve all the dependencies and node waam_app.js at the same time. If npm start doesn’t work, then run each command separately. 
4.	The app will run on localhost:3000 

**Accelerated hardware/GPU processing flags may have to be enabled if using Chrome or Edge browsers.

On Edge: https://www.bing.com/ck/a?!&&p=8c5eaf83b141a0bfe4b3008a23e38f3e2e4d5967cf4f88ce196f01d3903038e1JmltdHM9MTc4NjY2NTYwMA&ptn=3&ver=2&hsh=4&fclid=2963dea4-c80e-69b2-3500-cd73c9d668f0&psq=accelrated+gpu+edge&u=a1aHR0cHM6Ly9nZWVrcmV3aW5kLmNvbS9ob3ctdG8tZW5hYmxlLW9yLWRpc2FibGUtZ3JhcGhpY3MtaGFyZHdhcmUtYWNjZWxlcmF0aW9uLWluLW1pY3Jvc29mdC1lZGdlLw 

On Chrome: https://www.bing.com/ck/a?!&&p=d7ea05acbd34c38bca307b4c2dcbf9237ac1ea660de2a2a87ecc97bd37a5ceb0JmltdHM9MTc4NjY2NTYwMA&ptn=3&ver=2&hsh=4&fclid=2963dea4-c80e-69b2-3500-cd73c9d668f0&psq=accelrated+gpu+chrome&u=a1aHR0cHM6Ly9nZWVrcmV3aW5kLmNvbS9ob3ctdG8tZW5hYmxlLW9yLWRpc2FibGUtZ3JhcGhpY3MtYWNjZWxlcmF0aW9uLWluLWNocm9tZS8

The applications entry point is in the ‘waam_app.js’ file, which is set up to start a lightweight Node.js server with requests and responses allowing the browser to interpret HTML, JavaScript, JSON, CSS, images, and 3D model files that make up the application. These file types or “mime types” are written to the head of the response passed to the content type field.  This was particularly helpful for having the browser recognize and request the .obj, .mtl, and other assets I was working with through the same local server. The file also prevents requests from accessing files outside the project directory. The package.json file includes all the dependencies installed via npm. These packages are imported in ES module .js files and are loaded into the application asynchronously by default on runtime. 

Once the frontend completely loads, the user can interact with several modules that change the selected scenario or visualization state, causing the application to request or process the corresponding data and update the 3D scene and charts. Finally, the application is terminated upon clicking Ctrl + C in the terminal. 


