---
title: Getting started with Docker
author: martin-faartoft
date: 2016-07-30
template: article.jade
---

Documenting my first experiences with building and running Docker images.

<span class="more"></span>

## Motivation

[Docker 1.12](https://www.docker.com/products/docker) was released a few days ago, this time with a native Windows solution that does not depend on VirtualBox.

A few months back, I wrote a tiny Python script to send me weekly emails reminding me of upcoming family birthdays. I deployed it on an Azure VM and scheduled it using _cron_, where it hummed along for weeks until suddenly stopping.

When I read the Docker 1.12 announcement, I decided that I wanted to containerize my Python script and learn some Docker while doing so.

## Installation

The Docker binaries for Windows are distributed as an msi installer, so [installation](https://download.docker.com/win/stable/InstallDocker.msi) is extremely straight forward.

After succesful installation, a small Docker whale now graces the system tray, and powershell / cmd accepts Docker commands.

## Getting started

I spent a bit of time going through the [Getting started](https://docs.docker.com/docker-for-windows/#/step-1-install-docker-for-windows) guide, and highly recommend doing so.

The two main Docker abstractions are _container_s and _image_s. Images are blueprints for how to build containers, and containers are sandboxed environments capable of executing the code you want.

### Getting our fingers dirty

```
PS C:\code\remindme> docker run hello-world
Unable to find image 'hello-world:latest' locally
latest: Pulling from library/hello-world

c04b14da8d14: Pull complete
Digest: sha256:0256e8a36e2070f7bf2d0b0763dbabdd67798512411de4cdcf9431a1feb60fd9
Status: Downloaded newer image for hello-world:latest

Hello from Docker!
This message shows that your installation appears to be working correctly.

To generate this message, Docker took the following steps:
 1. The Docker client contacted the Docker daemon.
 2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
 3. The Docker daemon created a new container from that image which runs the
    executable that produces the output you are currently reading.
 4. The Docker daemon streamed that output to the Docker client, which sent it
    to your terminal.
```

Interesting! So we got an image from somewhere called the Docker Hub and used that to create and run a container. Let's use some basic Docker commands to see what traces are left.
```
PS C:\code\remindme> docker ps -a
CONTAINER ID  IMAGE       COMMAND   CREATED        STATUS                  PORTS  NAMES
1f7fdd77fb5f  hello-world "/hello"  4 minutes ago  Exited (0) 4 minutes ago       fervent_jones
```
`docker ps` shows all running containers on the current system, and the `-a` flag includes containers that have been stopped or exited by themselves.

```
PS C:\code\remindme> docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
hello-world         latest              c54a2cc56cbb        4 weeks ago         1.848 kB
```

`docker images` shows all images on the current system

Let's go ahead and remove the _hello-world_ container and image, now that we're happy that Docker is working as intended.
```
PS C:\code\remindme> docker rm fervent_jones
fervent_jones
PS C:\code\remindme> docker rmi hello-world
Untagged: hello-world:latest
Untagged: hello-world@sha256:0256e8a36e2070f7bf2d0b0763dbabdd67798512411de4cdcf9431a1feb60fd9
Deleted: sha256:c54a2cc56cbb2f04003c1cd4507e118af7c0d340fe7e2720f70976c4b75237dc
Deleted: sha256:a02596fdd012f22b03af6ad7d11fa590c57507558357b079c3e8cebceb4262d7
```

## Creating a Python 2 image for the reminder script

A bit of searching led me to the official [python](https://hub.docker.com/_/python/) Docker repository, and the instructions are refreshingly simple: create a file called `Dockerfile` with the following contents
```
FROM python:2-onbuild
CMD [ "python", "./your-daemon-or-script.py" ]
```

put that file in the same folder as your-daemon-or-script.py, along with a requirements.txt file containing the name and version of each dependency that your code needs. Now when a container is built from this Dockerfile, your sourcecode will be copied to the container filesystem and _pip_ will install your dependencies.

After asking docker to build an image called *remind_me* using the Dockerfile in current directory
```
PS C:\code\remindme> docker build -t remind_me .
Sending build context to Docker daemon 8.192 kB
Step 1 : FROM python:2-onbuild
# Executing 3 build triggers...
Step 1 : COPY requirements.txt /usr/src/app/
 ---> Using cache
Step 1 : RUN pip install --no-cache-dir -r requirements.txt
 ---> Using cache
Step 1 : COPY . /usr/src/app
 ---> 8f784a395965
Removing intermediate container aeb671a9f42d
Step 2 : MAINTAINER Martin Faartoft
 ---> Running in 14ad101edd76
 ---> 1a2eb1a37fca
Removing intermediate container 14ad101edd76
Step 3 : CMD python ./remind_me.py
 ---> Running in 28abab9a80f0
 ---> b80b24805438
Removing intermediate container 28abab9a80f0
Successfully built b80b24805438
```

Now running the *remind_me* image should execute the *remind_me.py* script inside the container

```
PS C:\code\remindme> docker run -d remind_me
c9622e9fe52f7f58742fd6a8f9d3eb07ca5e4bd7780a41348325d82908952456
```

The `-d` flag tells Docker that the container should be run as a daemon, meaning the call won't block and we won't see output from it in the terminal. 

Now let's verify that the *remind_me.py* script is actually running in the container

```
PS C:\code\remindme> docker ps
CONTAINER ID  IMAGE      COMMAND                 CREATED             STATUS              PORTS  NAMES
c9622e9fe52f  remind_me  "python ./remind_me.p"  About a minute ago  Up About a minute          lonely_banach
```

Looks promising, but let's open a shell on the container and investigate

```
PS C:\code\remindme> docker exec -it lonely_banach bash
root@c9622e9fe52f:/usr/src/app# ps aux
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.5  67440 12120 ?        Ss   14:49   0:00 python ./remind_me.py
root         5  0.3  0.1  21924  3548 ?        Ss   14:52   0:00 bash
root         9  0.0  0.1  19188  2404 ?        R+   14:52   0:00 ps aux
```
Nice!

The image is complete and the container is working as expected, but I don't want to host it on my own machine, instead let's hand it off to an Azure VM somewhere.

## Hosting Docker in Azure

Docker has support for many different cloud providers. As a Microsoft employee I get some Azure credits every month, so that's what I'm going with. 

[Docker - Microsoft Azure](https://docs.docker.com/machine/drivers/azure/) has instructions on how to create a Docker VM on Azure and configure your local Docker installation to access it.

```
PS C:\code\remindme> docker-machine create -d azure --azure-ssh-user <user> --azure-subscription-id <subscription id> <machine name>
Creating CA: ...\machine\certs\ca.pem
Creating client certificate: ...\machine\certs\cert.pem
Running pre-create checks...
(machine) Microsoft Azure: To sign in, use a web browser to open the page https://aka.ms/devicelogin. Enter the code XXXXXXXX to authenticate.
(machine) Completed machine pre-create checks.
Creating machine...
(machine) Querying existing resource group.  name="docker-machine"
(machine) Creating resource group.  name="docker-machine" location="westus"
(machine) Configuring availability set.  name="docker-machine"
(machine) Configuring network security group.  name="machine-firewall" location="westus"
(machine) Querying if virtual network already exists.  name="docker-machine-vnet" location="westus"
(machine) Configuring subnet.  cidr="192.168.0.0/16" name="docker-machine" vnet="docker-machine-vnet"
(machine) Creating public IP address.  name="machine-ip" static=false
(machine) Creating network interface.  name="machine-nic"
(machine) Creating storage account.  name="..." location="westus"
(machine) Creating virtual machine.  name="machine" location="westus" size="Standard_A2" username="..." osImage="canonical:UbuntuServer:15.10:latest"
Waiting for machine to be running, this may take a few minutes...
Detecting operating system of created instance...
Waiting for SSH to be available...
Detecting the provisioner...
Provisioning with ubuntu(systemd)...
Installing Docker...
Copying certs to the local machine directory...
Copying certs to the remote machine...
Setting Docker configuration on the remote daemon...
Checking connection to Docker...
Docker is up and running!
To see how to connect your Docker Client to the Docker Engine running on this virtual machine, run: C:\Program Files\Docker\Docker\Resources\bin\docker-machine.exe env machine
PS C:\code\remindme> docker-machine env machine
$Env:DOCKER_TLS_VERIFY = "1"
$Env:DOCKER_HOST = "tcp://<ip>:<port>"
$Env:DOCKER_CERT_PATH = "...\machine\machines\machine"
$Env:DOCKER_MACHINE_NAME = "machine"
# Run this command to configure your shell:
# & "C:\Program Files\Docker\Docker\Resources\bin\docker-machine.exe" env machine | Invoke-Expression
```

That was easy. After running the command at the end of the output, my local Docker is now talking to my new Azure VM instead of my local machine. I can get the IP of the VM by running
```
PS C:\code\remindme> docker-machine ip <machine name>
<ip>
```

Now we just need to get our new *remind_me* image from our local machine onto the VM. The easiest way would probably be to publish the image to [Docker Hub](https://hub.docker.com/), but I wanted to avoid that because I was lazy and hardcoded the email credentials in the script (don't do this!).

Instead I found out you can use docker to write an image to a .tar file, and load it on the VM.

From a new shell (the current one is speaking to the Azure VM and can't see your local images)
```
PS C:\code\remindme> docker save -o remind_me.tar remind_me
```
Now there's a big binary file lying around on disk, mine is ~700MB.

From the original shell:
```
PS C:\code\remindme> docker load -i remind_me.tar
42755cf4ee95: Loading layer [==================================================>] 130.9 MB/130.9 MB
d1c800db26c7: Loading layer [==================================================>] 45.57 MB/45.57 MB
338cb8e0e9ed: Loading layer [==================================================>] 135.2 MB/135.2 MB
ec0200a19d76: Loading layer [==================================================>] 326.4 MB/326.4 MB
90022d1ffd75: Loading layer [==================================================>] 1.849 MB/1.849 MB
617f1e2dcdae: Loading layer [==================================================>] 66.63 MB/66.63 MB
ea132dd77599: Loading layer [==================================================>] 6.457 MB/6.457 MB
dcccbfab90ed: Loading layer [==================================================>]  2.56 kB/2.56 kB
5ca6990e4259: Loading layer [==================================================>] 3.584 kB/3.584 kB
3ae9c1064699: Loading layer [==================================================>] 1.208 MB/1.208 MB
9d7c6f61c309: Loading layer [==================================================>] 10.75 kB/10.75 kB
Loaded image: remind_me
```
This can take a long time, depending on your upload speed. When it completes, our new Docker image exists on the VM as well!
```
PS C:\code\remindme> docker images
REPOSITORY  TAG     IMAGE ID      CREATED      SIZE
remind_me   latest  9f6919de65e8  1 hours ago  692.7 MB
```

And the only thing remaining is to spin up a container based on the image
```
PS C:\code\remindme> docker run -d --restart=always remind_me
6372eafb11844e20a1c381b4e3baf6491b80177ad856e0734eb830f3a36cfe11
```

By adding the `--restart-always` flag, we tell Docker that this container should be restarted in case the VM is restarted.

## Wrapping up
* We managed to get Docker installed and running on a Windows machine. 

* We built our own Docker image and tested it locally. 

* We created an Azure VM, copied our image there, and finally built a container that runs in the background and even survives restarts. 

All without leaving the comfort of our command line.