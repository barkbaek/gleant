#!/bin/bash
touch ~/1
cd ~/
touch ~/2
if [ -d "Gleant" ]; then
    touch ~/3
	/home/ec2-user/Gleant/node_modules/forever/bin/forever stop /home/ec2-user/Gleant/app.js
	touch ~/4
	rm -rf ~/Gleant
	touch ~/5
	service nginx stop
	touch ~/6
else
    touch ~/7
	yum update -y
	touch ~/8
	yum groupinstall 'Development Tools' -y
	touch ~/9
	curl https://raw.githubusercontent.com/creationix/nvm/v0.25.0/install.sh | bash
	touch ~/10
	source ~/.bashrc
	touch ~/11
	nvm install 6.11.2
	touch ~/12
	yum install -y nginx
	touch ~/13
fi
touch ~/14
mkdir ~/Gleant
touch ~/15
cd ~/Gleant
touch ~/16
aws s3 cp s3://gleant-backup/gleant.zip gleant.zip
touch ~/17
unzip gleant.zip
touch ~/18
rm -rf gleant.zip
touch ~/19
mv nginx.conf /etc/nginx/nginx.conf
touch ~/20
chmod 644 /etc/nginx/nginx.conf
touch ~/21

npm install
export NODE_ENV=production
/home/ec2-user/Gleant/node_modules/forever/bin/forever start --minUptime 5000 --spinSleepTime 2000 -a /home/ec2-user/Gleant/app.js
service nginx start