# Orgdo

## Features

- server/clint architecture
- manage todo and agenda
- full features task properties

## Model

- tasks

  id, name, desc, tags
  priority(critical, high, low)
  time-related(start, started, complete, completed)
  misc(est)
  status(todo, todo-call, todo-outdate, doing, doing-outdate, done, cancel)

- settings

  | name   | settings |
  | ------ | -------- |
  | tomato | {}       |

- taomatos

  id, taskid, started, span

## Cli

```
orgdo list @query # use @query to select tasks, show task list,
orgdo edit # update task at @id with @changes

# tomato clock specific command
orgdo clock start [@id] # start clock clock for task @id
orgdo clock break # break clock clock
orgdo clock status # check clock clock status
orgdo clock list @query # show clock clock statistics

# cron specific command
orgdo cron list
orgdo cron add
orgdo cron delete
orgdo cron edit
```
