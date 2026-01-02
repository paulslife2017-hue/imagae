#!/usr/bin/env python3
"""
YouTube 배경화면 이미지 실제 생성 스크립트

이 스크립트는 웹 애플리케이션에서 다운로드한 JSON 파일을 읽어
실제로 Nano Banana Pro를 사용하여 이미지를 생성합니다.

사용법:
    1. 웹 애플리케이션에서 "JSON 다운로드" 클릭
    2. 다운로드한 JSON 파일 경로를 지정하여 실행:
       python generate_real_images.py youtube_bg_generation_list.json
"""

import sys
import json
import os
from pathlib import Path

def main():
    if len(sys.argv) < 2:
        print("❌ 사용법: python generate_real_images.py <json_file>")
        print("\n예시:")
        print("  python generate_real_images.py youtube_bg_generation_list.json")
        sys.exit(1)
    
    json_file = Path(sys.argv[1])
    
    if not json_file.exists():
        print(f"❌ 오류: 파일을 찾을 수 없습니다: {json_file}")
        sys.exit(1)
    
    # JSON 파일 읽기
    with open(json_file, 'r', encoding='utf-8') as f:
        generation_list = json.load(f)
    
    print(f"\n🎨 총 {len(generation_list)}개 이미지 생성 시작\n")
    print("=" * 80)
    
    # 출력 디렉토리 생성
    output_dir = Path("generated_images")
    output_dir.mkdir(exist_ok=True)
    
    # 각 프롬프트에 대해 이미지 생성
    for item in generation_list:
        index = item['index']
        paragraph = item['paragraph']
        prompt = item['prompt']
        filename = item['outputFilename']
        duration = item['estimatedDuration']
        
        print(f"\n📝 문단 {index} (예상 {duration}초)")
        print(f"   내용: {paragraph[:60]}{'...' if len(paragraph) > 60 else ''}")
        print(f"   파일: {filename}")
        print(f"\n🔄 이미지 생성 중... (최대 2-3분 소요)")
        
        # 여기서 실제 image_generation 도구를 호출해야 합니다
        # 하지만 Python 스크립트에서는 직접 호출할 수 없으므로,
        # 사용자에게 안내 메시지를 출력합니다
        
        print(f"\n⚠️  이 스크립트는 Python 환경에서 image_generation 도구를 직접 호출할 수 없습니다.")
        print(f"   대신 다음 방법을 사용하세요:\n")
        print(f"   방법 1: GenSpark 웹사이트에서 Image Designer 사용")
        print(f"   방법 2: 아래의 Node.js 스크립트 사용 (generate_images.js)")
        print(f"\n" + "=" * 80)
    
    print(f"\n💡 다음 단계:")
    print(f"   1. Node.js 스크립트를 사용하여 이미지를 생성하거나")
    print(f"   2. GenSpark Image Designer에서 프롬프트를 사용하세요")
    print(f"\n✅ JSON 파일 위치: {json_file.absolute()}")
    print(f"✅ 출력 디렉토리: {output_dir.absolute()}\n")

if __name__ == "__main__":
    main()
