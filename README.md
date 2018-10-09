# Orgdo

## Features

- server/clint architecture
- manage todo and agenda
- full features task properties

## Model

- tasks

  id, name, note, tags, priority(critical, high, low, today), time-related(done, started, canceled, start, end, estimates)

- settings

  | name   | settings |
  | ------ | -------- |
  | tomato | {}       |

- taomatos

  id, taskid, started, span

## Cli

```
orgdo history (@n|clear) # repeate history at @n or clear history
orgdo list @query # use @query to select tasks, show task list,
orgdo statistic @query # use @query to select tasks, show statistics of tasks.
orgdo update @id @changes # update task at @id with @changes

# tomato clock specific command
orgdo-tomato update @changes # tomato clock settings
orgdo-tomato start [@id] # start tomato clock for task @id
orgdo-tomato break # break tomato clock
orgdo-tomato status # check tomato clock status
orgdo-tomato statistic @query # show tomato clock statistics
```
