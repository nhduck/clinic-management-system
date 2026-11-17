FROM nginx:stable-alpine
COPY client/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY client/index.html /usr/share/nginx/html/
COPY client/pages/ /usr/share/nginx/html/pages/
COPY client/js/ /usr/share/nginx/html/js/
COPY client/css/ /usr/share/nginx/html/css/
