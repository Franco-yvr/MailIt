Team Mail It! WIP Code Drop - April 9th, 2021 

Upload template process: the following edge cases have been implemented: 

-When there are duplicate dynamic values it will only appear once 

-Empty documents will not be accepted as templates 

-Files used for creating templates must have unique names


Batch email campaign: This process has been made more robust by handling the following negative paths/edge cases

-The csv file must contain the correct number of columns to equal the number of dynamic values plus 1 (for the Email Address column)

-If there are any empty lines above the last row an error message will be thrown

-If there is an empty cell in the table an error message will be thrown 

-If the columns do not have the correct name (either Email Address or the dynamic value names) an error message will be thrown 

PLEASE NOTE: this has not been made robust to deal with duplicate columns with a valid Dynamic Value name. We will be implementing this on Friday. Also on the create email campaign page there should be an example csv file with the format needed for making a batch email campaign 


Security: We have implemented a solution to ensure that if a user is not logged and tries to access the application through the URL they will be redirected to the login page

UI bugs: We have added an edit columns option on the homepage to ensure that horizontal scrolling is not immediately required when the page is loaded. Also sorting is available on many of the columns on all grids 

Remove template: We have implemented an option to remove a template using a template name since SES limits the number of stored templates to 10,000 and we could not find a way to delete them manually through the AWS management console. 

Campaign/Email Log grids: With each template there is now a button available to see all campaign (can contain one or multiple emails) logs and for each campaign log we can see the list of email logs associated with that campaign. 

Email Delivery/Opened Status: Currently our campaign and email log grids should demonstrated whether the email was delivered successfully or not and whether it was opened by the user. It is working most of the time however the team is trying to isolate the pattern of when the fields are not updating. 

Email “Clicked Link” Status: This column is meant to indicate if at least one link has been clicked in an email. 

Team Mail It! WIP Code Drop - March 30th, 2021 

1. The “Update Temporary Credentials” page has been updated with more helping text for the user to understand the purpose of the page. More error handling has been added to ensure that whitespace cannot be present in the username and to ensure that the new and confirmed password match, and if the user tries to login from the “Update Temporary Credentials” page an error message will appear that will ask the user to sign in from the main authentication page. 


2. The homepage has been rearranged to ensure the user will see all non-template grid elements on the left hand side. The team is currently working hard to have a “edit columns” option to add or remove columns to their discretion. The columns that will appear on default (and cannot be removed) will be Template Name, File Name, Upload Date, Create Email Campaign, and Campaign Logs. This feature has been prioritized to avoid horizontal scrolling on the homepage and should appear in the next deployment 


3. The “Upload Template” process on the homepage has been updated with a Template Name field. In addition to this, more thorough dynamic value parsing/error handling: 
-Only alpha-numeric and underscore characters will be permitted for creating dynamic value names 

-Embedded dynamic values (i.e. ${ …. ${....}}) will not be permitted and an error will appear to indicate this issue 

-Trailing dynamic values (i.e. ${.....) will not be permitted and an error will appear to indicate this issue 

4.   The Campaign Page has had a few updates:
 
-A subject line will be required when sending a single email campaign 

-A “Return to Home” button appears at the top right corner of the page 

-Email addresses used to send a single email can have trailing whitespace however no leading whitespace is permitted 

-Currently the dynamic value fields for the single email campaign are only validated to ensure that they are not empty when the submit button is clicked. This validation will be discussed this evening with the sponsor. 

5. Batch Email Campaign Creation is now available in the Create Email Campaign page:
-The user must provide a csv file and a subject line to create a batch email campaign 

-An example file has been provided in the UI for the user to reference when creating a csv file 

PLEASE NOTE: this currently only works with happy path scenarios. The happy path scenario consists of the following criteria: 
-An “Email Address” column with correctly formatted emails 
-One column is present for each dynamic value. All columns are filled (i.e. no empty string cells as values) 
-The csv file has a minimum of 3 valid entries. If a csv file has less than 3 valid entries the csv file will have an empty row and therefore an error message will appear in the user interface. The team is looking for a workaround to this. 

6. Unsubscribing to emails 
-Templates uploaded after March 30th will contain an unsubscribe link that when clicked on will unsubscribe the user. PLEASE NOTE: if you unsubscribe an email from this system you will need to notify Team Mail It! To add you back as a verified email address in SES 

Upcoming Tasks For the Next Sprint 

-Homepage fixes to avoid horizontal scrolling and to provide the user the ability to edit the columns visible on the page to their discretion 

-The team is working to build the campaign and email log grids that are associated with each template 

-Handling of negative paths in the batch email creation process to make the process more robust.

-The security issue of being able to access any page through the URL without logging into the system will be fixed 

-If time permits the team will try and start the internationalization and remove template stretch goals 





Team Mail It! WIP Code Drop - March 23rd, 2021 

1. The login page will now display an error message when a user provides an incorrect password and when the user exceeds the number of failed login attempts. 
2. The homepage no longer has an issue with the template log grid and the right elements overlapping as the screen shrinks. The user should be able to horizontally scroll 

3. The Template log grid on the homepage has had a few updates:
-The templates are sorted such that the newest template uploaded will appear at the top of the grid 
-The template logs now display the dynamic values that were parsed from the document.
-A loading spinner will appear while the template log is loading 

4. The upload process has had a few updates:
-Templates with malformed dynamic values will not be accepted for uploading and an error message will appear indicating this issue to the user 
-Any templates uploaded after March 23rd will have an “Unsubscribe link” embedded in the footer of the email (this link is not fully operational yet but we’re close to ironing out the last bugs) 
-After the upload process finishes only the grid will refresh instead of the whole page 
Errors that occur in the AWS infrastructure during the upload process should display in an error message in the front end
-A loading spinner should appear during the upload process 
PLEASE NOTE: A template name input field will be added to the upload process in the next deployment. 

Sending a SINGLE email campaign 
-Each dynamic value should appear with its own text field
-Any fields that are empty when the submit button (for the single email campaign set of fields) will have a red-colored border and an error message should appear for the user to fill in all fields. If the email address provided is an invalid format then an error message will appear indicating the issue to the user and the email address field will have a red border.
-When a template has no dynamic values then there should be no text fields that appear and the “Dynamic Values” heading should not be present 

PLEASE NOTE: Please don’t use any of the ReadTemplateLogsTest.docx templates to send emails since they are just database logs with no SES templates associated with them. This is being used to help test the pagination of the logs in the grid that will appear in the next deployment. In addition to this, please be advised that email addresses are still sandboxed and therefore require verification by AWS before being used in this application. If you would like your email added to this service please notify Matthew De Rose so that he may add you to SES manually. Please feel free to use the credentials for the test email below to use this application (these credentials work on gmail as well):
The credentials for Gmail and the deployment environment are: 
Email: teamMailItTest@gmail.com
Password: testEmail123

Upcoming Tasks For The Next Code Drop
-Create a database instance solely for the deployment environment so no testing data appears in the development server
-Adding a text field for a user to add a template name associated with a file in the upload process
-Integration with the existing AWS infrastructure and the user interface for the pagination of logs in the user interface (will be used for all logs ultimately)
-Final integration with the existing AWS infrastructure and the user interface for the batch email campaign process 
-Linking campaign logs and associated email logs for each template log in the user interface. Each log will have its own grid 
-Ironing out the final bugs of the unsubscribe process
-Finalizing the process of updating the OpenedStatus and Delivery status of an email log 
-Starting off the internationalization stretch goal 

March 16th, 2021 WIP Updates 


Updates Visible In The User Interface 
1. The home page grid (i.e. the template log grid) is now populated with template logs stored in the dynamodb tTemplateLog. The columns that still require implementation are the Team Column (with the team that uploaded the template), No. of Campaigns (number of campaigns created with this tempalte) and the view button in the Campaign Logs column. Also the Status Column has been changed to the "Create Email Campaign" column, the Details column has been changed to the "Campaign Logs" column, the Template Key column has been changed to the File Name column. 
2. The "upload new template" section on the right hand side of the home page has been updated such that there is now a submit button that the user will click on after a docx file has been uploaded. 
3. If the Ready button is clicked on for a template log in the Create Email Campaign column the user will be redirected to a page with a current preview of the image. Email campaigns cannot be created using the UI just yet however a single email can be sent using the API. The AWS infrastructure is being finalized for the batch email service and one of our teammembers has started the process of integrating the user interface with the AWS infrastructure. By the next code drop next sunday we are hoping to be able to send a single email using the user interface. 
4. The user login still has a few bugs with having error messages appear on the page and the "remember me" function is not operational. A teammember is working to resolve these issues by the next code drop next Sunday. 
5. The docx file upload process is now integrated with the template log grid on the home page. Currently after a template is successfully created the page will refresh the whole page and the log will appear on the grid. As of this momment the newest template log does not appear at the top of the grid and can appear at any place on the grid. We are working to order the template logs by upload date and time in addition to making sure that only the grid updates when a new template is successfully uploaded (and the whole page does not have to refresh in order to update the grid). 

Updates Not Currently Visible In The User Interface 
1. When a customer opens an email we are able to update the Opened Status of the email log stored in dynamo db
2. When a template has an ${UNSUBSCRIBE_LINK} dynamic value added to it, it will be populated with a link that will allow any customer to unsubscribe from future emails from the system. For the next code drop we hope that all uploaded templates will have this dynamic value embedded into the footer of the template. 
3. The first implementation of the aws infrastructure for the batch email campaign service has been created and is being tested

Hopeful Updates for the next sprint. 
1. All login bugs will be resolved 
2. The campaign log and email log grids will be created and possibly integrated with the template log grid on the home page. 
3. A single email will be able to be sent from the user interface and hopefully the batch email service will usable with the UI as well 
4. The delivery status of an email will be reflected in the email log 
5. Any errors that occur in the upload process will appear as an error message. Currently if an error occurs the messsage displayed in the front end user interface is a success message which is not desired. 
6. Logs will be paginated such that there is a fixed maximum amount of logs that can appear at once. 
7. 

Design Changes 
1. We have introduced the Campaign Log data type to our data model. Since 1000s of emails can be created in a single campaign we felt the need to create a log for each campaign created to improve accesssibility of the user to email logs that may have occured previously. This log will contain information about when the campaign was created, the number of emails (one or more) included in a campaign, the number of successfully delivered emails, the number of emails that have been opened by users, the number emails that have had at least one link clicked on by a user and a link to all email logs associated with a campaign. Campaign logss will be either accessibile per tempalte from the the tempalte log grid or from the "View All Campaign Logs" button on the right hand side of the home page (which will provide the list of campaign logs created from all templates ordered by date.
