<?php
$base_dir = realpath(dirname(__FILE__));

$newTemplate = array(
	"name" => "",
	"showResult" => "true",
	"IATtype" => "two",
	"catA" => array(
		"label" => "",
		"datalabel" => "",
		"itemtype" => "txt",
		"items" => array()
	),
	"catB" => array(
		"label" => "",
		"datalabel" => "",
		"itemtype" => "txt",
		"items" => array()
	),
	"cat1" => array(
		"label" => "",
		"datalabel" => "",
		"itemtype" => "txt",
		"items" => array()
	),
	"cat2" => array(
		"label" => "",
		"datalabel" => "",
		"itemtype" => "txt",
		"items" => array()
	)
);

//update active and available templates
function updateActive($optArr=NULL)
{
	$active_str = file_get_contents('../templates/active.txt');
	$active = json_decode($active_str);
	
	// When "op" = "setActive", calls updateActive with 'newActive' option set
	if(isset($optArr) && isset($optArr['newActive']))
	{
		$active->active = $optArr['newActive'];
	}
	else if(isset($optArr['op']) && $optArr['op'] == 'saveTemplate')
	{
		if($active->active == $optArr['oldName'])
		{
			$active->active = $optArr['newName'];
		}
	}
	else if(isset($optArr['op']) && $optArr['op'] == 'deleteTemplate')
	{
		if($active->active == $optArr['oldName'])
		{
			$active->active = 'Empty';
		}
	}
	
	$available = array();
	if ($handle = opendir('../templates/')) 
	{
	    $blacklist = array('.', '..', 'active.txt');
	    while (false !== ($file = readdir($handle))) {
	        if (!in_array($file, $blacklist)) {
	            array_push($available,$file);
	        }
	    }
	    closedir($handle);
	}
	natcasesort($available);
	$active->available = $available;
	
	$active_fh = fopen("../templates/active.txt", 'w');
	fwrite($active_fh, json_encode($active));
	fclose($active_fh);
	
}


// check ending of files listed
function endsWith($haystack, $needle)
{
    $start = strlen($needle) * -1;
    return (substr($haystack, $start) === $needle);
}

// pull all output files
function getstats($completed)
{
	foreach ($completed as $fname)
	{
		if(endsWith($fname, ".txt"))
		{
			
		}
	}
}

// write output of test to output directory
function writeoutput($output)
{
	$sub = isset( $_REQUEST['subject'] ) ? $_REQUEST['subject'] : 'unknown2' ;
	$src = isset( $_REQUEST['src'] ) ? $_REQUEST['src'] : 'HUH' ;

	$data = $_REQUEST["data"]; $randtxt = date('Y-m-d-H-s-');
	$fh = fopen($folder_dir. $src . "_" . $sub . '-' . $randtxt . '.txt', 'w');
	fwrite($fh, $data);
	fclose($fh);
}


// High level interface: process command sent from javascript
if( isset($_REQUEST['op']) )
{
	switch($_REQUEST['op'])
	{
		case 'exists':
			if( isset($_REQUEST['template']) )
			{		
				if( isset($_REQUEST['files']) )
				{
					$newfiles = array();
					foreach ( $_REQUEST['files'] as $file )
					{
						$fullpath = "templates/".$_REQUEST['template']."/img/".$file;
						if (file_exists("../".$fullpath))
						{
							array_push($newfiles, $fullpath);
						}
						else
						{
							array_push($newfiles, "core/no-image.jpg");
						}
					}
					echo implode(",",$newfiles);
				}
				else
				{
					echo "Error 1.1: files to check not specified";
				}
			}
			else
			{
				echo "Error 1.0: template not specified";
			}
			break;
		case 'setActive':
			if( isset($_REQUEST['template']) )
			{
				$optArr = array('newActive' => $_REQUEST['template']);		
				updateActive($optArr);
				echo "success";
			}
			else
			{
				echo "Error 3.0: template not specified";
			}
			break;
		case 'saveTemplate':
			if( isset($_REQUEST['template']) )
			{		
				if( isset($_REQUEST['oldname']) && isset($_REQUEST['form']) )
				{
					$newform = $newTemplate;
					$form = array();
					parse_str($_POST['form'], $form);
				 	if (!is_array($form) || count($form) == 0) {
				        // something went wrong, initialize to empty array
				        echo "Error 2.2: form data not properly formatted: \n" . $_REQUEST['form'];
				    }
					else {
						$errors = "";
						// template name is set, has only alphanumeric characters, and is < 30 characters
						if(!isset($form["template-name"]) ||
							strlen($form["template-name"]) > 30 || 
							$form["template-name"] != preg_replace('/[^A-Za-z0-9]+/','',$form["template-name"]))
						{
							$errors .= "<li class='error-item'>";
							$errors .= "Please input a valid template name (less than 30 alphanumeric characters only) ";
							$errors .= " </li>";
						}
						else
						{
							if ($form["template-name"] == "Empty")
							{
								$errors .= "<li class='error-item'>";
								$errors .= "<div style='color:red'>'Empty' is a reserved Template name</div>";
								$errors .= " </li>";
							}
							// if new name != old name, and new name already taken, return error
							if ($_REQUEST['oldname'] != $form["template-name"] && file_exists("../templates/".$form["template-name"]."/input.txt"))
							{
								$errors .= "<li class='error-item'>";
								$errors .= "<div style='color:red'>Template name " . $form["template-name"] . " is taken.</div>";
								$errors .= " </li>";
							}
							else
							{
								$newform["name"] = $form["template-name"];
							}
						}
						// IAT type
						if(!isset($form["IAT-type"]))
						{
							echo "Error 2.4: IAT type not set";
						}
						else
						{
							$newform["IATtype"] = $form["IAT-type"];
						}
						// show result
						if(!isset($form["show-results"]))
						{
							echo "Error 2.5: Show results not set";
						}
						else
						{
							$newform["showResult"] = $form["show-results"];
						}
						// for each category
						$newfiles = array();
						$catnames = array("A","B","1","2");
						for ($i=1;$i<=4;$i++)
						{
							$newfiles["tabs".$i] = array();
							// if category is visible
							if($form["tabs".$i."-shown"]=="true")
							{
								// category name
								if(!isset($form["tabs".$i."-catlabel-input"]) ||
									strlen($form["tabs".$i."-catlabel-input"]) > 30 || 
									$form["tabs".$i."-catlabel-input"] != preg_replace('/[^A-Za-z0-9\-\(\)\$\#\@\? ]+/', '', $form["tabs".$i."-catlabel-input"]))
								{
									$errors .= "<li class='error-item'>";
									$errors .= "Please input a valid category label for Category " . $catnames[$i-1];
									$errors .= " </li>";
								}
								else
								{
									// add category label
									$newform["cat".$catnames[$i-1]]["label"] = $form["tabs".$i."-catlabel-input"];
								}
								// data label
								if(!isset($form["tabs".$i."-datalabel-input"]) ||
									strlen($form["tabs".$i."-datalabel-input"]) > 3 || 
									$form["tabs".$i."-datalabel-input"] != preg_replace('/[^A-Za-z0-9]+/','',$form["tabs".$i."-datalabel-input"]))
								{
									$errors .= "<li class='error-item'>";
									$errors .= "Please input a valid data label for Category " . $catnames[$i-1] . " (less than 3 alphanumeric characters)";
									$errors .= " </li>";
								}
								else
								{
									// add data label
									$newform["cat".$catnames[$i-1]]["datalabel"] = $form["tabs".$i."-datalabel-input"];
								}
								// text or images
								if(!isset($form["tabs".$i."-txt"]) && !isset($form["tabs".$i."-img"]))
								{
									echo "Error 2.6: Text or images not set for category " . $catnames[$i-1];
								}
								else
								{
									if(isset($form["tabs".$i."-txt"]))
									{
										$newform["cat".$catnames[$i-1]]["itemtype"] = "txt";
										$txtorimg = "txt";
									}
									else
									{
										$newform["cat".$catnames[$i-1]]["itemtype"] = "img";
										$txtorimg = "img";
									}
									// get max id number for items
									if(!isset($form["max-cat".$catnames[$i-1]]))
									{
										echo "Error 2.7: Maximum item number not set for category " . $catnames[$i-1];
									}
									else
									{	
										// for each item
										for ($j=0; $j<=$form["max-cat".$catnames[$i-1]]; $j++)
										{
											// if text
											if($txtorimg == "txt")
											{
												// some values of $j might not exist if items deleted
												if(array_key_exists("cat".$catnames[$i-1].$j."-txt", $form))
												{
													// check if has ".jpg", etc.
													if( preg_match("/\.[A-Za-z]{2,4}/",$form["cat".$catnames[$i-1].$j."-txt"]))
													{
														$errors .= "<li class='error-item'>";
														$errors .= "The text input, '" . $form["cat".$catnames[$i-1].$j."-txt"];
														$errors .= "' in Category " . $catnames[$i-1] . " appears to be a file name.";
														$errors .= " </li>";
													}
													else if ( preg_match("/[^A-Za-z0-9\-\(\)\$\#\@\? ]+/", $form["cat".$catnames[$i-1].$j."-txt"]))
													{
														$errors .= "<li class='error-item'>";
														$errors .= "The text input, '" . $form["cat".$catnames[$i-1].$j."-txt"];
														$errors .= "' in Category " . $catnames[$i-1] . " is not valid.";
														$errors .= " </li>";
													}
													else
													{
														array_push($newform["cat".$catnames[$i-1]]["items"], $form["cat".$catnames[$i-1].$j."-txt"]);
													}
												}
											}
											// if images
											else
											{	
												// some values of $j might not exist if items deleted
												if(array_key_exists("cat".$catnames[$i-1].$j."-txt", $form))
												{
													// verify image exists
													$imgfile = "templates/" . $_REQUEST['oldname'] . "/img/" . $form["cat".$catnames[$i-1].$j."-txt"];
													if( $_REQUEST['oldname'] != "Empty" && !file_exists("../".$imgfile))
													{
														$errors .= "<li class='error-item'>";
														$errors .= $form["cat".$catnames[$i-1].$j."-txt"];
														$errors .= " in Category ".$catnames[$i-1]." is not a valid file name.";
														$errors .= "</li>";
														array_push($newfiles["tabs".$i], "core/no-image.jpg");
													}
													else
													{
														array_push($newfiles["tabs".$i], $imgfile);
														array_push($newform["cat".$catnames[$i-1]]["items"], $form["cat".$catnames[$i-1].$j."-txt"]);
													}
												}
											}
										}	
									}
								}

							}
						}
						
						// if no errors
						if(strlen($errors) == 0)
						{
							// encode object as JSON string
							$json_template = json_encode($newform);
							
							// if new template
							if ($_REQUEST['oldname'] == "Empty")
							{
								// create new folders
								mkdir("../templates/".$form["template-name"]);
								mkdir("../templates/".$form["template-name"]."/img");
								mkdir("../templates/".$form["template-name"]."/output");
								// add new template to available list
								updateActive();
							}
							// else if template name has changed
							else if ($_REQUEST['oldname'] != $form["template-name"])
							{	
								// check for template-name conflict happened earlier, so this is safe
								rename("../templates/".$_REQUEST['oldname'],"../templates/".$form["template-name"]);
								
								// check if old name is currently active, if so, change?
								// also need to rename in active.txt
								$optArr = array('oldName'	=> $_REQUEST['oldname'],
												'newName'	=> $form['template-name'],
												'op'		=> 'saveTemplate');
								updateActive($optArr);
							}
							$inputfile = fopen("../templates/".$form["template-name"]."/input.txt", 'w');
							fwrite($inputfile, $json_template);
							fclose($inputfile);
							echo "success";
						}
						// else
						else
						{
							$returnstring = '{"images":{';
							// return errors
							foreach($newfiles as $key => $value)
							{
								$returnstring .= '"'.$key.'":"'.implode(",",$value).'",';
							}
							$returnstring = substr($returnstring, 0, -1);
							$returnstring .= '}, "errors":"'.$errors.'"}';
							echo $returnstring;	
						}
					}
				}
				else
				{
					echo "Error 2.1: old name or form not specified";
				}
			}
			else
			{
				echo "Error 2.0: template not specified";
			}
			break;
		case 'deleteTemplate':
			if( isset($_REQUEST['template']) )
			{	
				$folder_dir = "../templates/".$_REQUEST['template'];
				
				if( file_exists($folder_dir) )
				{
					if(file_exists($folder_dir."/img"))
					{
						foreach (scandir($folder_dir."/img") as $item) {
						    if ($item == '.' || $item == '..') continue;
						    unlink($folder_dir."/img/".$item);
						}
						rmdir($folder_dir."/img");
					}
					if(file_exists($folder_dir."/output"))
					{
						foreach (scandir($folder_dir."/output") as $item) {
						    if ($item == '.' || $item == '..') continue;
						    unlink($folder_dir."/output/".$item);
						}
						rmdir($folder_dir."/output");
					}
					if(file_exists($folder_dir."/input.txt"))
					{
						unlink($folder_dir."/input.txt");
					}
					rmdir($folder_dir);
					
					$optArr = array('oldName'	=> $_REQUEST['template'],
									'op'		=> 'deleteTemplate');
					updateActive($optArr);
				}
				else
				{
					echo "Error 5.1: template does not exist";
				}
			} 
			else	
			{
				echo "Error 6.0: template name not specified";
			}
			break;
		case 'getstats':
			if( isset($_REQUEST['root']) )
			{
				if( isset($_REQUEST['output']) )
				{
					$completed = scandir($base_dir + $_REQUEST['root'] + $_REQUEST['output']);
					getstats($completed);
				}
				else
				{
					echo "Error 4.1: output directory not specified";
				}
			} 
			else	
			{
				echo "Error 4.0: root directory not specified";
			}
			break;
		case 'aggregate':
			break;
		case 'writeoutput':
			if( isset($_REQUEST['template']) )
			{
				if( isset($_REQUEST['data']) )
				{
					$folder_dir = "../templates/".$_REQUEST['template']."/output/";

					$sub = isset( $_REQUEST['subject'] ) ? $_REQUEST['subject'] : 'unknown2' ;

					$data = $_REQUEST["data"]; 
					$datetxt = date('Y-m-d-H-s');
					$fh = fopen($folder_dir. $_REQUEST['template'] . "-" . $sub . '-' . $datetxt . '.txt', 'w');
					fwrite($fh, $data);
					fclose($fh);
				}
				else
				{
					echo "Error 5.1: data not provided";
				}
			} 
			else	
			{
				echo "Error 5.0: template name not specified";
			}
			break;
	}	
} 
else 
{
	echo "Error -1: no operation specified";
}

?>
