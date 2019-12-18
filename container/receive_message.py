# Copyright 2010-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License"). You
# may not use this file except in compliance with the License. A copy of
# the License is located at
#
# http://aws.amazon.com/apache2.0/
#
# or in the "license" file accompanying this file. This file is
# distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
# ANY KIND, either express or implied. See the License for the specific
# language governing permissions and limitations under the License.

import os
import sys
import logging
import boto3
from botocore.exceptions import ClientError


def retrieve_sqs_messages(sqs_queue_url, region_name='cn-north-1', num_msgs=1, wait_time=0, visibility_time=5):
    """Retrieve messages from an SQS queue

    The retrieved messages are not deleted from the queue.

    :param sqs_queue_url: String URL of existing SQS queue
    :param num_msgs: Number of messages to retrieve (1-10)
    :param wait_time: Number of seconds to wait if no messages in queue
    :param visibility_time: Number of seconds to make retrieved messages
        hidden from subsequent retrieval requests
    :return: List of retrieved messages. If no messages are available, returned
        list is empty. If error, returns None.
    """

    # Validate number of messages to retrieve
    if num_msgs < 1:
        num_msgs = 1
    elif num_msgs > 10:
        num_msgs = 10

    # Retrieve messages from an SQS queue
    sqs_client = boto3.client('sqs', region_name=region_name)
    try:
        resp = sqs_client.receive_message(QueueUrl=sqs_queue_url,
                                          AttributeNames=[
                                             'SentTimestamp'
                                          ],
                                          MessageAttributeNames=[
                                             'All'
                                          ],
                                          MaxNumberOfMessages=num_msgs,
                                          WaitTimeSeconds=wait_time,
                                          VisibilityTimeout=visibility_time)
    except ClientError as e:
        logging.error(e)
        return None

    # Return the list of retrieved messages
    try:
        msgs = resp['Messages']
    except KeyError:
        msgs = []
    return msgs


def delete_sqs_message(sqs_queue_url, msg_receipt_handle, region_name='cn-north-1'):
    """Delete a message from an SQS queue

    :param sqs_queue_url: String URL of existing SQS queue
    :param msg_receipt_handle: Receipt handle value of retrieved message
    """

    # Delete the message from the SQS queue
    sqs_client = boto3.client('sqs', region_name=region_name)
    sqs_client.delete_message(QueueUrl=sqs_queue_url,
                              ReceiptHandle=msg_receipt_handle)


def main():
    """Exercise retrieve_sqs_messages()"""

    # Set up logging
    logging.basicConfig(level=logging.INFO,
                        format='%(levelname)s: %(asctime)s: %(message)s')

    sqs_queue_url = os.environ['SQS_QUEUE_URL'] if os.environ['SQS_QUEUE_URL'] is not None else sys.argv[1]
    region_name = os.environ['AWS_REGION'] if os.environ['AWS_REGION'] is not None else sys.argv[2]
    if sqs_queue_url is None:
        logging.error('Missing input parameter SQS_QUEUE_URL')
        return
    if region_name is None:
        logging.error('Missing input parameter AWS_REGION')
        return
    num_messages = 10
    logging.info('sqs_queue_url: %s for region: %s' % (sqs_queue_url, region_name))

    # Retrieve SQS messages
    while True:
        msgs = retrieve_sqs_messages(sqs_queue_url, region_name, num_messages)
        if msgs is not None:
            for msg in msgs:
                logging.info('SQS: Message ID: %s, Contents: %s ' %({msg["MessageId"]}, {msg["Body"]}))

                # Remove the message from the queue
                delete_sqs_message(sqs_queue_url, msg['ReceiptHandle'], region_name)


if __name__ == '__main__':
    main()