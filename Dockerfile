FROM ubuntu:14.04

## Install djbdns
RUN apt-get update && \
	apt-get install daemontools daemontools-run ucspi-tcp djbdns tinyproxy nginx -y

# Ensure UTF-8
RUN locale-gen en_US.UTF-8
ENV LANG       en_US.UTF-8
ENV LC_ALL     en_US.UTF-8

## Configure dnscache
# users
RUN useradd -s /bin/false dnscache && \
	useradd -s /bin/false dnslog
# config dir and service
RUN dnscache-conf dnscache dnslog /etc/dnscache 127.0.0.1 && \
	ln -s /etc/dnscache /etc/service/dnscache

RUN tinydns-conf dnscache dnslog /etc/tinydns 127.0.0.2 && \
	ln -s /etc/tinydns /etc/service/tinydns

## Container addons scripts
ADD ./init.sh /init.sh
ADD ./tinyproxy.conf /etc/tinyproxy.conf
RUN chmod u+x /init.sh;mkdir /var/run/tinyproxy;chmod 0777 /var/run/tinyproxy
RUN sed -i -e"s/^Allow /#Allow /" /etc/tinyproxy.conf

## Docker config
EXPOSE 53/udp 
EXPOSE 53
EXPOSE 8888
CMD ["/init.sh"]
