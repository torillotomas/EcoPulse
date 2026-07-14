import asyncio
from bullmq import Worker
import os
from dotenv import load_dotenv

load_dotenv()

async def process(job, job_token):
    print(job.data)

async def main():
    worker = Worker("observation-queue", process, {"connection": os.getenv("REDIS_URL")})
    await asyncio.Event().wait()

if __name__ == "__main__":
    asyncio.run(main())