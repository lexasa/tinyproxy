#!/bin/bash
/usr/sbin/nginx
svscan /etc/service &
/usr/sbin/tinyproxy -d

