---
title: .gitignore
author: martin-faartoft
date: 2013-10-22
template: article.jade
---

In which we consider what to put in the .gitignore file for EiffelStudio projects.

<span class="more"></span>

As a rule of thumb, you should never add auto-generated files to source control. But exceptions must be made - for example with the Diagrams you draw inside Eiffel Studio.

Let's have a look at the file structure of a new EiffelStudio project.

	application.e
	hello_world.ecf
	hello_world.rc
	EIFGENs
	EIFGENs/hello_world/
	EIFGENs/hello_world/project.epr
	EIFGENs/hello_world/BACKUP/
	EIFGENs/hello_world/COMP/
	EIFGENs/hello_world/Cluster/
	EIFGENs/hello_world/Data/
	EIFGENs/hello_world/Diagrams/
	EIFGENs/hello_world/F_code/
	EIFGENs/hello_world/Partials/
	EIFGENs/hello_world/Testing/
	EIFGENs/hello_world/W_code/

The *.e files are your source code files.
The *.ecf files contains metadata about your project, like name of primary cluster, and type of application

Everything in the EIFGENs directory is created by EiffelStudio, and will be regenerated when required, based on our .e files. 

So we should exclude everything in EIFGENs from source control, except the Diagrams subdirectory, since that is where our user-created diagrams live.

Example .gitignore file:
	
	*.log

	#Ignore everything in EIFGENs, except the Diagrams subdirectory
	EIFGENs/**/*
	!EIFGENs/*/Diagrams/