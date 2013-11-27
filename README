**********************************************************
* project: Open Source, Web-based IAT
* authors: Winter Mason (m@winteram.com)
* 	   Steven Allon 
*	   Pinar Ozturk
* source: https://github.com/winteram/IAT
**********************************************************

OVERVIEW:
---------

This is meant to be an easy-to-use implicit association test (see
Greenwald, McGhee, & Schwartz, 1998) for use by interested
psychologists. The flow of the test is driven by javascript, and
participant responses are stored in a comma-delimited text file.  At the
end of the test, a simple effect size is calculated to determine the
participant's tendency to find two categories more congruent than the other
two categories.

To create and modify versions of the IAT, and to make them available to
participants, the experimenter can direct their browser to the
"experimenter.php" file.


REQUIREMENTS:
-------------

Server-side: PHP (with permission to write files in directory)
	     (optional) MySQL with root access
Client-side: Javascript-enabled web browser


USE:
----

1) copy the folder to a publicly accessible folder on your web server

2) from a shell prompt (i.e., Terminal in Mac or Linux, PuTTy in Windows) type 'sh setup.sh'

3) create a new version of the IAT using the experimenter tool (Direct your
   browser to [yourserver.com]/IAT/experimenter.php)

4) [only necessary if IAT uses images] After creating the template, upload
   the images to the folder "IAT/[template name]/img"

5) Direct participants to your IAT! (e.g., [yourserver.com]/IAT)


OUTPUT:
-------

The output files are in the "output" folder within the template folder for the active IAT.  
The columns are as follows:

Trial #
Round #
Category Label
Category Index (which item within the category)
Errors
Reaction Time (in milliseconds)
