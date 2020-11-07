git fetch
git pull
docker build -t dustin/fight-bot .
docker rm --force Fight-Bot
docker run -d --restart always --cap-add=SYS_ADMIN --name Fight-Bot -p 4536:4536 dustin/fight-bot
