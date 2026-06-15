import asyncio
from starlette.concurrency import run_in_threadpool
from app.routes.resume import extract_text_from_file, parse_resume_text

async def test():
    file_path = "test.pdf"
    file_bytes = b"%PDF-1.4\n1 0 obj\n<<\n/Title (Test PDF)\n>>\nendobj\n"
    
    try:
        raw_text = await run_in_threadpool(extract_text_from_file, file_path, file_bytes)
        print("extract OK")
        parsed_json = await run_in_threadpool(parse_resume_text, raw_text)
        print("parse OK")
    except Exception as e:
        import traceback
        traceback.print_exc()

asyncio.run(test())
