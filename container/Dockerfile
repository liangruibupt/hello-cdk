FROM centos:centos7

LABEL maintainer="ruiliang@amazon.com"

RUN yum -y update; yum clean all
RUN yum -y install epel-release; yum clean all
RUN yum -y install python3-pip; yum clean all
RUN pip3 install --upgrade pip;
RUN pip install boto3;
COPY . /src
CMD cd /src 
ENTRYPOINT ["python3", "/src/receive_message.py"]