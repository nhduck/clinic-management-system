FROM nginx:stable-alpine
COPY client/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY client/index.html client/app.js /usr/share/nginx/html/
COPY client/js/ /usr/share/nginx/html/js/
COPY client/styles/ /usr/share/nginx/html/styles/
