git fetch
git pull
docker build -t dustin/fight-bot .
docker rm --force Fight-Bot
docker run -d --restart always --cap-add=SYS_ADMIN --name DM-Fight-Bot -p 6787:6787 dustin/fight-bot
