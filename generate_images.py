#!/usr/bin/env python3
"""
YouTube 배경화면 이미지 생성 스크립트

이 스크립트는 텍스트 파일에서 문단을 읽어 
Nano Banana Pro 모델을 사용하여 이미지를 생성합니다.

사용법:
    python generate_images.py paragraphs.txt

입력 파일 형식:
    각 줄이 하나의 이미지가 됩니다.
    빈 줄은 무시됩니다.
"""

import sys
import json
from pathlib import Path

# 스타일 프롬프트 (분석된 이미지 스타일 기반)
STYLE_PROMPT = """Style: Digital illustration with hand-drawn effect, warm earthy colors (browns, beiges, soft blues), 
simple cartoonish characters with expressive faces, brick wall background with windows, 
educational atmosphere, Korean text integrated naturally like chalk on blackboard or subtitles."""

def estimate_duration(text):
    """문단 길이에 따라 재생 시간 추정"""
    length = len(text)
    if length < 50:
        return 3
    elif length < 100:
        return 5
    elif length < 200:
        return 7
    else:
        return 10

def create_prompt(paragraph, duration):
    """이미지 생성 프롬프트 생성"""
    return f"""{STYLE_PROMPT}

Korean Content: {paragraph}

Create an educational illustration that visually represents this Korean text content. 
The image should be engaging, clear, and suitable as a YouTube video background for approximately {duration} seconds of narration.
Maintain consistent visual language with warm, inviting colors and clear composition.
Aspect ratio: 16:9 for YouTube compatibility."""

def main():
    if len(sys.argv) < 2:
        print("사용법: python generate_images.py paragraphs.txt")
        print("\n입력 파일 예시 (paragraphs.txt):")
        print("1974년, 미국 한 대학교의 강연장에 레이 A. 크록이 연설을 하고 있습니다.")
        print("맥도날드 창업자 레이 A. 크록은 학생들에게 성공의 비결에 대해 이야기합니다.")
        sys.exit(1)
    
    input_file = Path(sys.argv[1])
    
    if not input_file.exists():
        print(f"오류: 파일을 찾을 수 없습니다: {input_file}")
        sys.exit(1)
    
    # 파일 읽기
    with open(input_file, 'r', encoding='utf-8') as f:
        paragraphs = [line.strip() for line in f if line.strip()]
    
    if not paragraphs:
        print("오류: 입력 파일이 비어있습니다.")
        sys.exit(1)
    
    print(f"총 {len(paragraphs)}개 문단 발견")
    print("\n=== 이미지 생성 프롬프트 목록 ===\n")
    
    # 각 문단에 대한 프롬프트 생성
    generation_list = []
    for i, paragraph in enumerate(paragraphs, 1):
        duration = estimate_duration(paragraph)
        prompt = create_prompt(paragraph, duration)
        
        generation_list.append({
            "index": i,
            "paragraph": paragraph,
            "duration": duration,
            "prompt": prompt,
            "output_filename": f"youtube_bg_{i:02d}.png"
        })
        
        print(f"문단 {i} (예상 {duration}초):")
        print(f"  {paragraph[:80]}{'...' if len(paragraph) > 80 else ''}")
        print()
    
    # JSON 파일로 저장
    output_json = input_file.stem + "_generation_list.json"
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(generation_list, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ 생성 목록이 저장되었습니다: {output_json}")
    print("\n다음 단계:")
    print("1. GenSpark 웹사이트에서 이미지 생성 에이전트 생성")
    print("2. 생성된 JSON 파일의 프롬프트를 복사하여 사용")
    print("3. 또는 image_generation 도구를 사용하여 자동 생성")
    
    # 총 재생 시간 계산
    total_duration = sum(item['duration'] for item in generation_list)
    minutes = total_duration // 60
    seconds = total_duration % 60
    print(f"\n📊 총 예상 재생 시간: {total_duration}초 ({minutes}분 {seconds}초)")

if __name__ == "__main__":
    main()
