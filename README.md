# Orgdo

> Command-line tool to manage the Todo lists.

<!-- ![Orgdo workflow]() -->

## Features

- Manage todo lists
- Support tomato clocks
- Support cronjobs

## Install

```
npm i -g orgdo
```

## Commands

### Add a task

```
orgdo add "Name of task"
```

You can add tags to mark project or owner.

```
orgdo add --tags myproject,bob "Invite bob to talk about the project"
```

You can add description. The description can be multipeline text with markdown-like fashion

```
orgdo add --describe 'Descripe can be multipeline text with markdown-like fashion.\nBold: Use asterisks for *bold*\nItalic: Use underscores for _italic_\nStrikethrough: Use tildes for ~strikethrough~\nCode:  Use backticks for `code'  "Task may have description"
```

Task has priority

```
orgdo add --priority high "Task have priority"
```

Determine the start time or dealine of task

```
orgo add --start "3d" --complete "1w" "Task need to get started in 3 days and be finished in a week"
```

### Update a task

```
orgdo update --name "Rename the task" 1
```

### Change task state

Task have state: todo, doing, done, canceled

```
orgdo start 1
orgdo done 1
orgdo cancel 1
```

### Remove a task

```
orgdo rm 1
```

### List tasks

No options will list the tasks to be done today.

```
orgdo list
```

List all tasks with `--all`
```
orgdo list --all
```

Search tasks

```
orgdo list --name "persentation"
```

Filter tasks by task properities
```
orgdo list --tags myproject,blob
orgdo list --tags blob --tags myproject
orgdo list --priority high
orgdo list --status todo --status doing
```

Filter tasks by time

```
orgdo list --start 3 #  3 days later
orgdo list --complete <3 # in 3 days
orgdo list --started -3 # 3 days ago
orgdo list --completed @3 # at least 3 days ago
```

Show task statistic
```
orgdo list --with-stat
```

## Clock commands 

Orgdo support [tomato clock](https://en.wikipedia.org/wiki/Pomodoro_Technique). When the timer is up, orgdo will notify.


### Start a clock

```
orgdo clock start
```

### Stop/Abort the clock
```
orgdo clock stop
```

### Get clock state

```
orgdo clock state
```

### Update clock settings

```
orgdo clock set --work-time 25
orgdo clock set --short-break-time 10
orgdo clock set --long-break-time 20
orgdo clock set --long-break-count 4
```

### List clocks

```
orgdo clock list
```

## Cron Commands

Orgdo enable add task with cron

Cron pattern: 

```
 # ┌────────────── second (optional)
 # │ ┌──────────── minute
 # │ │ ┌────────── hour
 # │ │ │ ┌──────── day of month
 # │ │ │ │ ┌────── month
 # │ │ │ │ │ ┌──── day of week
 # │ │ │ │ │ │
 # │ │ │ │ │ │
 # * * * * * *
```

### Add a cronjob

Add a cronjob that add task at 8:00 am every Fri.

```
orgdo cron add --task "Summay the job in this week" "0 0 8 * * 5"
```

### Update a cronjob

```
orgdo cron update --cron "0 0 10 * * 1" 1
```

###  Remove a cronjob

```
orgdo cron rm 1
```

### List cronjobs

```
orgdo list
```

## License

MIT @ Sigoden Huang