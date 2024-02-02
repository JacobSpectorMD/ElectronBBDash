# BBDash

## Setup from Installer (Mac)
1. Download the application installer
   - Currently available at: https://drive.google.com/file/d/1JjfHu8nRdrQuhUqfIzCJtYHrUp7lOoYA/view?usp=drive_link
2. Double-click on the installer and drag BBDash to your applications folder
3. To run the application, right click on the icon and then click Open 
   - Note: double-clicking on the icon will not work the first time you run the application, but will
   work subsequently

## Setup from Installer (Windows)
- To Do

## Setup from Git Repository
Using the code from this Git repository will allow you to edit and customize the application. However, it is only
recommended for users with some programming experience, as it can involve a significant
amount of troubleshooting.

1. Install Git if you do not already have it on your computer
    - If you need help with install Git, please see https://git-scm.com/book/en/v2/Getting-Started-Installing-Git
2. Install Node.js and node package manager (npm) if you do not already have them on your computer
   - If you need help with this, please see https://docs.npmjs.com/downloading-and-installing-node-js-and-npm
3. Clone the ElectronBBDash repository to your computer
    - Use the terminal to navigate to your desired folder, e.g.
    ```cd /Users/jacob/apps```
    - Use the git clone command to download the repository to your computer: ```git clone https://github.com/JacobSpectorMD/ElectronBBDash.git```
4. Navigate to the ElectronBBDash folder
    - For example ```cd /Users/jacob/apps/electronbbdash```
5. Use npm to install the required packages
    - The command for this is ```npm install```
6. Run the application using the command ```npm run electron:serve```


## Using BBDash
1. Navigate to the Settings tab then click on the Create Database button
2. Choose a name and location for your database, and click Save
   - Please remember the location of your database, as it may contain patient information and should be deleted if you 
   are no longer using the application
3. If the newly created database does not show up on the list of databases, try clicking the Refresh Databases
button or restarting the application. 
4. Once the database appears on the list, ensure that it is active by looking for a green checkmark in the Active column
   - If there is not a green checkmark, click on the path to the database to select it as active
5. Click on Database dropdown and navigate to the Transfusion tab
6. Add your location/providers files by dragging them into the dashed box
   - You may use the example file provided in /example_files/Provider and Location Example.txt
7. Add your utilization files by dragging them into the dashed box
   - You may use the example file provided in /example_files/Utilization Example.txt
8. (Optional) Add providers' specialties in the Database --> Providers tab
   - In the text field enter the following values separates by tabs: first name, middle name, last name, specialty
   - If the middle name of the provider is not known, it may be left blank by using two tabs between the first and last name
8. Navigate to the Graphs tab
9. The default view is the Products view. Click on the Graph button to create a graph of all data that you have added
   - You may use any of the dropdowns or the date fields to narrow down your data
10. Click on Providers to see the providers view
   - Choose your product type of interest from the dropdowns, and filter using the dropdowns and date fields
   - Click on the Graph button to create graphs comparing different providers
