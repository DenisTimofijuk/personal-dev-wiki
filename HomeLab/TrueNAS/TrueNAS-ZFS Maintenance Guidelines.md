# TrueNAS / ZFS Maintenance Guidelines

## 1. Overview

### ZFS Scrub

- Purpose: Scans allocated data and metadata, verifying checksums and repairing any detected errors using redundancy (e.g., mirror).
- Duration: Depends on used data size, disk performance, fragmentation, and workload.

### SMART Tests

- Types:
  - **Short** (few minutes)
  - **Long / Extended** (hours—varies by drive size)
  - **Conveyance** (very short, often for transit checks)
- Warning: Should **never run on the same day** as a scrub or resilver due to high disk load impacting performance and reliability. ([TrueNAS Open Enterprise Storage][1])

## 2. Expected Durations

### Scrub Duration (Rule of Thumb)

Approximately **1–2 hours per TiB of *used* space** on healthy disks:

- Example: 1.7 TB → \~3 hours  ⇒ 4 TB used → \~6.5 hours ([TrueNAS Open Enterprise Storage][2])
- Factors affecting scrub time: fragmentation, metadata layout, concurrent workloads, drive health. ([The FreeBSD Forums][3], [TrueNAS Community Forums][4])

### SMART Test Durations

- **Short**: usually under 10 minutes ([TrueNAS Open Enterprise Storage][1])
- **Long**: Several hours and can exceed 24 hours on large disks (e.g., multiple days on 20 TB drives) ([TrueNAS Open Enterprise Storage][5], [Reddit][6])

## 3. Recommended Frequencies (Community Best Practices)

| Test Type            | Frequency                            | Notes                                                                                |
| -------------------- | ------------------------------------ | ------------------------------------------------------------------------------------ |
| **Short SMART**      | Every 1–7 days                       | Quick health check                          ([TrueNAS Open Enterprise Storage][5])   |
| **Long SMART**       | Every 1–4 weeks                      | In-depth surface scan                       ([TrueNAS Open Enterprise Storage][5])   |
| **ZFS Scrub**        | Every 2–4 weeks                      | Maintains data integrity                    ([TrueNAS Open Enterprise Storage][7])   |
| **Weekly Alternate** | Alternate scrub and long SMART tests | Two scrubs and two long SMART tests per month ([TrueNAS Open Enterprise Storage][5]) |

#### Community-specific schedules

- **Thread schedule**:
  > “I run short SMART tests daily at midnight, long SMART tests weekly at 01:00 Saturdays, and scrubs every other Sunday at midnight.” ([TrueNAS Open Enterprise Storage][8])

- **Alternate-week schedule**:
  > “Short tests about twice per week. One week: ZFS scrub; next week: long SMART test. Alternate each week—never overlap.” ([TrueNAS Open Enterprise Storage][5])

- **Monthly date-based schedule**:
  - Scrubs: 1st & 15th at 04:00 (threshold \~10 days)
  - Short SMART: 5, 12, 19, 26 @03:00
  - Long SMART: 8th & 22nd @04:00
  - Avoid scheduling on 28–31 to prevent skipping in shorter months ([TrueNAS Open Enterprise Storage][9])

- **Modern small-office approach**:
  - Scrub every 35 days (Sunday midnight)
  - Long SMART weekly (Wednesday 19:00)
  - Short SMART daily (16:00) ([Practical ZFS][10])

## 4. Avoiding Yearly Conflicts

If you schedule scrubs monthly and SMART long tests monthly (e.g., on fixed dates), they may eventually land on the same day. Strategies to prevent conflict:

1. **Alternate weekly schedules**
   - Week 1: ZFS scrub
   - Week 2: SMART long test
   - Ensures they never clash and maintains steady coverage ([TrueNAS Open Enterprise Storage][5])

2. **Date offset schedule**
   - e.g., Scrub on 1st & 15th; Long SMART on 8th & 22nd; Short SMART in between. ([TrueNAS Open Enterprise Storage][9])

3. **Threshold tuning**
   - Use thresholds (e.g., run scrub when last scrub ≥ 10 days ago) to avoid unintended overlaps ([TrueNAS Open Enterprise Storage][9])

4. **Scripted chaining**
   - Use `zpool scrub -w` to wait for scrub to finish, then trigger SMART test — ensures they never run simultaneously. ([Practical ZFS][10])

## 5. Sample Markdown Schedule Template

### TrueNAS Maintenance Schedule

#### Recommended Frequencies

| Task           | Frequency           | Schedule Example              |
|----------------|---------------------|-------------------------------|
| Short SMART    | Every 1–7 days      | Daily at 03:00                |
| Long SMART     | Every 2 weeks       | Alternate Saturdays at 02:00  |
| ZFS Scrub      | Every 2 weeks       | Night after long SMART (Sunday) |

#### Sample Alternating Weekly Schedule

- **Week A:**
  - Sunday 02:00 – ZFS Scrub (Pool A)
  - Monday 03:00 – Short SMART (All disks)
  - (No Long SMART this week)
- **Week B:**
  - Sunday 02:00 – Long SMART (All disks)
  - Monday 03:00 – Short SMART
  - (No Scrub this week)

Repeat every 4 weeks — ensures no overlap and consistent checks.

#### Tips

- Never schedule **SMART tests** and **scrubs** on the same day — avoid performance conflicts. :contentReference[oaicite:17]{index=17}  
- Tune thresholds lower than desired intervals to compensate for task run time. :contentReference[oaicite:18]{index=18}  
- Consider cooling impact when running tests across many disks simultaneously — stagger SMART tests if needed. :contentReference[oaicite:19]{index=19}  
- After each task, check results via **Storage → Disks → [disk] → S.M.A.R.T. Test Results** (or via `smartctl`). :contentReference[oaicite:20]{index=20}  

## 6. Final Notes

- Adjust task times to **off-peak hours** to minimize impact on users and services.
- Monitor disk health reports and examine SMART test logs regularly.
- If you change pool usage patterns (more data used, slower disks, heavier workload), revisit your schedule and adjust intervals as needed.

[1]: https://www.truenas.com/docs/scale/scaletutorials/dataprotection/smarttestsscale/?utm_source=chatgpt.com "Managing S.M.A.R.T. Tests"
[2]: https://www.truenas.com/community/threads/why-is-my-scrub-taking-so-long.42062/?utm_source=chatgpt.com "Why is my scrub taking so long?"
[3]: https://forums.freebsd.org/threads/scrub-task-best-practice.78802/?utm_source=chatgpt.com "ZFS - Scrub task best practice"
[4]: https://forums.truenas.com/t/is-scrub-required-and-why-is-it-taking-extremely-long/12211?utm_source=chatgpt.com "Is scrub required and why is it taking extremely long?"
[5]: https://www.truenas.com/community/threads/s-m-a-r-t-smart-best-practice.40340/?utm_source=chatgpt.com "S.M.A.R.T smart best practice! | TrueNAS Community"
[6]: https://www.reddit.com/r/truenas/comments/17krazj/how_often_should_i_run_scrub_and_smart_tests_on/?utm_source=chatgpt.com "How often should i run Scrub and SMART tests on pools"
[7]: https://www.truenas.com/community/threads/how-often-should-smart-and-scrub-tests-be-done.44089/?utm_source=chatgpt.com "How often should Smart and Scrub tests be done?"
[8]: https://www.truenas.com/community/threads/recommended-smart-tests-and-scrub-settings.28062/?utm_source=chatgpt.com "Recommended SMART tests and scrub settings?"
[9]: https://www.truenas.com/community/threads/scrub-and-smart-testing-schedules.20108/?utm_source=chatgpt.com "Scrub and SMART testing schedules"
[10]: https://discourse.practicalzfs.com/t/questions-re-optimizing-scrub-and-smart-test-schedules-for-hdd-and-nvme-ssd-pools-home-small-office/2556?utm_source=chatgpt.com "Optimizing SCRUB and SMART Test Schedules for HDD ..."
