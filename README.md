
Introduction :- To setup a private export server in NodeJs, you will need the official NodeJs export handler provided in the FusionCharts package. The export handler will provide the necessary files to configure the export server. It will handle all exporting requests sent by the user and generate the chart in the requested format. 

How does it work?

A. Modern Bowser

Step 1: A chart is rendered in the browser.
Step 2: When an export option is selected, the chart generates the Image data (Base64 encoded  string) that represents the current state and sends it to the export server.
Step 3: The export server captures the string.
Step 4: The export server invokes middleware function to convert the FusionCharts generated Image Data string to PDF, JPG, PNG, and SVG. To export chart data as XLS, the CSV data generated from the charts is converted to the XLS format.
Step 5: The export handler either writes the exported chart/chart data to disk, based on the configuration provided by the chart, or streams it back to the user as a download.

B. Old Bowser

Step 1: A chart is rendered in the browser.
Step 2: When an export option is selected, the chart generates the SVG string that represents the current state and sends it to the export server.
Step 3: The export server captures the SVG string.
Step 4: The export server invokes a middleware function and Imagemagick to convert the FusionCharts generated SVG string to PDF, JPG, PNG, and SVG. 
Step 5: The export handler either writes the exported chart/chart data to disk, based on the configuration provided by the chart, or streams it back to the user as a download.

Requirements and Dependencies:- 

1. express
2. body-parser
3. fs
4. imagemagick
5. timestamp
6. cors
7. regex

Configuring the export server

To use the private export server, the following attributes need to be configured correctly in the chart.

Attribute Name	Description

exportEnabled	Set to 1 to enable exporting the chart.
			eg. "exportEnabled":"1"


exportAtClientSide	Set to 0 to enable export via a Private 					Export Server. eg.
				"exportAtClientSide" : "0"

exportHandler	Set to the link of the export server of the 				export handler. eg.
			"exportHandler" :"http://192.168.0.55:3300/"


exportAction	Set to save to store the exported file on the 				private export server itself. Set to download to 			send the file back to the user (client) for 				download. eg. "exportAction" : "save"


