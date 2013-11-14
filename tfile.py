import os
import inspect

def h():
#     print "Setting up textfile permissions"
    dirpath=os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
    filename="templates"
    path = os.path.join(dirpath, filename)
#     print path
	#setting permission for the templates folder
    os.chmod(path, 0o777)
    for dirpath, dirnames,filenames in os.walk(path):
    	for filename in filenames:
    		#print filename
    		path2 = os.path.join(dirpath, filename)
        	os.chmod(path2, 0o777) 
    	for dirname in dirnames:
    		#print dirname
        	path3 = os.path.join(dirpath, dirname)
        	os.chmod(path3, 0o777)
    
    
    
h()