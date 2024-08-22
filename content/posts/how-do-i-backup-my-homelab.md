---
weight: 10
title: 'How I Back Up My Data'
date: 2024-08-22T14:00:00.315Z
description: ''
tags: ['aws', 'self-hosting', 'backup']
type: post
showTableOfContents: true
draft: false
---

In my last article, I explained how Docker saved me when my Raspberry Pi, which hosted all my services, suddenly failed. Indeed, Docker allows for good compartmentalization of configurations and data, and lets you choose where to store them, which in my case was an external hard drive. In case of a failure, you just need to take the hard drive and connect it to another machine, and you're done.

These kinds of accidents happen quite often unfortunately, and the method I just described is quite effective in solving this problem.
However, what happens if it's the external hard drive that fails or worse, if I have a fire? In that case, do I lose everything?

This type of incident is rarer. I've never experienced a hard drive failure. All the hard drives I bought in the previous decade are still working. So it was more difficult for me to build an infrastructure resilient to this kind of problem. I managed to do it anyway, and I'm going to present how I proceed. I'll introduce you to deduplication with Borg Backup and Amazon S3 Glacier.

## 1. 3-2-1 Rule

For setting up a backup plan, I follow this principle that seems to be a consensus of having three different copies of your data:

- Use at least 3 copies
- Use two different types of media
- And have one off-site copy

The off-site copy is what allows you to survive a fire, for example.  
That's good for the overview and guiding principle, let's see how I apply it.

## 2. Borg Backup and Deduplication

### 1. Install Borg Backup

The main problem when making backups is the redundancy of data between different backups. Fortunately, tools like Borg exist, allowing us to make incremental backups. This means, the first time it backs up all your files, but the other times it only records the changes, which saves bandwidth and also space on the backup disk.

If Borg Backup is not yet installed:

```bash
$ sudo apt install borgbackup
```

### 2. Configure AWS CLI

Configure AWS CLI with your AWS access information:

```bash
aws configure
```

You will be prompted to enter the following information:

- AWS Access Key ID: Your AWS access key.
- AWS Secret Access Key: Your AWS secret key.
- Default region name: The AWS region in which your S3 bucket is located (e.g. us-west-2).
- Default output format: You can leave this blank or choose json.

Now you need to create an amazon bucket, and take care to create a glacier deep archive bucket.

Once you've done that, you can create a

```bash
$ aws s3 sync /mnt/seagate/borg-repo s3://my-borg-backups
```

For restoration

```bash
$ aws s3 sync s3://my-borg-backups /mnt/restore-point
```

I'll show you the final script for the backup

```bash
REPOSITORY="/mnt/seagate/borg-repo”
SOURCE="/mnt/ssd/”
BORG_S3_BACKUP_BUCKET="bucket-name”


export BORG_PASSPHRASE='PASSPHRASE'

# Backup to borg repo
borg create -v --stats $REPOSITORY::$(date +%Y-%m-%d-%h) $SOURCE


# Backup to s3
aws s3 sync $REPOSITORY s3://$BORG_S3_BACKUP_BUCKET --storage-class DEEP_ARCHIVE --delete
```

Finally, I call my script in a cron job every day

If you've made it this far, you now have an automated 3-2-1 backup system with deduplication and an off-site copy.
