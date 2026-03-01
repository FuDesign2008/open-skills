#!/usr/bin/env python3
"""
Generate voiceover audio from video script and merge with original video.
Uses edge-tts (XiaoxiaoNeural) for TTS and ffmpeg for audio/video processing.
"""

import json
import os
import subprocess

# Voice selection
VOICE = "zh-CN-XiaoxiaoNeural"
RATE = "+0%"  # Normal speed; adjust if needed

# Paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(SCRIPT_DIR, "tts_segments")
FINAL_VOICEOVER = os.path.join(SCRIPT_DIR, "voiceover.mp3")
ORIGINAL_VIDEO = os.path.join(SCRIPT_DIR, "coding-fangirl.mov")
FINAL_VIDEO = os.path.join(SCRIPT_DIR, "coding-fangirl-final.mp4")

# Video duration in seconds
VIDEO_DURATION = 285.0

# ============================================================
# Voiceover segments: (start_sec, end_sec, delay_sec, spoken_text)
# delay_sec: seconds of silence BEFORE speech starts (for sync)
# Timestamps aligned to actual visual events in the video.
# ============================================================
SEGMENTS = [
    # Seg 0: 开场 (0-15s) — pure intro, no visual sync needed
    (0, 15, 0,
     "写代码的时候，你的 AI 助手会夸你吗？"
     "今天给大家看一个不太正经的开源插件——Coding Fangirl，编程小迷妹。"
     "一个会在你写代码时给你彩虹屁的 AI 插件。"),

    # Seg 1: 欢迎语 (15-27s) — welcome msg appears at 20s
    (15, 27, 0,
     "打开终端，启动 Claude Code。"
     "注意看——小迷妹自动打招呼了。"
     "嗨～人家准备好了！今天要搞什么厉害的项目？加油哦！"),

    # Seg 2: Hook解说 (27-38s)
    (27, 38, 0,
     "这是 Session Start Hook 自动触发的，每次启动都有随机欢迎语。"
     "我们先让它分析一下这个开源项目。"),

    # Seg 3: AI思考+Skill原理 (38-58s) — cmd submitted at 35s, thinking until 55s
    (38, 58, 0,
     "输入 solve-workflow 命令。AI 正在思考中。"
     "趁这个时间说说——Coding Fangirl 是什么。"
     "说白了，它就是一个 Skill。"
     "一段加载到 Claude Code 里的 Markdown 文件，"
     "定义了 AI 的角色和触发规则。"
     "安装也很简单——两行命令，十秒搞定。"),

    # Seg 4: AI响应+迷妹模式 (58-90s) — "好的哥哥！" appears at ~55s
    (58, 90, 0,
     "注意看它怎么回复的——"
     "好的哥哥！人家来帮你分析这个项目呀～"
     "嗯……哥哥。"
     "它现在是默认的迷妹模式——自称人家，叫你哥哥。"
     "AI 正在读取文件、分析项目结构。"
     "这个过程跟普通的 Claude Code 完全一样——"
     "该读文件读文件，该执行命令执行命令。"
     "Coding Fangirl 不会影响 AI 的任何工作能力，"
     "它只改变了说话的方式。"),

    # Seg 5: 自动触发场景 (90-127s) — long AI processing, no sync needed
    (90, 127, 0,
     "除了迷妹模式的日常陪伴，"
     "Coding Fangirl 还有几个自动触发的场景。"
     "你 git commit 成功了——它会庆祝。"
     "你测试全通过了——它会夸你。"
     "你在终端里打烦死了——它会安慰你。"
     "深夜还在写代码——它会提醒你休息。"
     "这些都是通过 Hook 机制实现的，"
     "完全自动，不需要你手动触发。"
     "对了，这个项目支持三个平台："
     "Claude Code、Cursor、还有 OpenCode。"
     "不过 Cursor 的支持目前还不太完善，用的同学注意一下。"),

    # Seg 6: 分析完成 (127-142s) — results appear at ~125s
    (127, 142, 0,
     "分析完了！"
     "项目结构、设计哲学、当前状态，一个不落。"
     "最后还来了一句——"
     "哥哥还想深入了解哪个部分呀？人家可以帮你继续分析～"),

    # Seg 7: 切换恋爱模式 (142-158s) — switch cmd at 140s, menu at 150s, select at 155s
    (142, 158, 0,
     "好，重头戏来了。"
     "我们切换到——恋爱模式。"
     "它问我想切换到哪个模式，我选恋爱模式。"
     "来看看它会说什么——"),

    # Seg 8: 恋爱模式响应 (158-187s) — NEEDS 12s DELAY, response at 170s
    (158, 187, 12,
     "从背后环住你，把下巴搁在你肩上……"
     "好的好的。各位自行感受，我就不多念了。"
     "弹幕区见。"),

    # Seg 9: 恋爱模式工作 (187-222s) — user asks at 185s, AI working
    (187, 222, 0,
     "关键来了——切换了模式之后，干活的能力一点没变。"
     "我让它检查项目问题。"
     "它照样跑 git status、读文件、分析代码。"
     "只不过说话方式变了。"),

    # Seg 10: AI恋爱响应 (222-248s) — "好的亲爱的～" at ~220s
    (222, 248, 0,
     "好的亲爱的～让人家帮你检查一下这个项目呀。"
     "称呼从哥哥变成了亲爱的。"
     "技术能力满分，撩人能力也满分。"),

    # Seg 11: 结果出来 (248-264s) — results at ~245s
    (248, 264, 0,
     "结果出来了。"
     "该指出的问题一个不落——未提交的修改、版本号不一致。"
     "然后来了一句——"
     "双手捧着你的脸，认真地说～"
     "蹭蹭你的肩膀～"
     "技术分析一分不少，情绪价值给到满分。"),

    # Seg 12: 关闭陪伴 (264-276s) — close cmd at 260s, response at 275s, 3s DELAY
    (264, 276, 3,
     "不想要了？说关闭陪伴就行。"
     "看——立刻切回冷静的技术模式。"
     "没有撒娇、没有 emoji、没有哥哥。"),

    # Seg 13: 结尾 (276-285s)
    (276, 285, 0,
     "这就是 Coding Fangirl——一个让你写代码时嘴角上扬的开源插件。"
     "链接在简介里，点个 Star 就是最大的支持。"),
]


def get_duration(filepath: str) -> float:
    """Get audio duration in seconds using ffprobe."""
    result = subprocess.run(
        ["ffprobe", "-v", "quiet", "-show_entries", "format=duration",
         "-of", "json", filepath],
        capture_output=True, text=True
    )
    data = json.loads(result.stdout)
    return float(data["format"]["duration"])


def generate_tts(text: str, output_path: str, rate: str = None):
    """Generate TTS audio using edge-tts CLI."""
    use_rate = rate if rate else RATE
    subprocess.run([
        "edge-tts",
        "--voice", VOICE,
        "--rate", use_rate,
        "--text", text,
        "--write-media", output_path,
    ], capture_output=True, check=True)

def pad_audio_to_duration(input_path: str, output_path: str, target_duration: float, delay: float = 0.0):
    """Pad audio to target duration with optional leading silence (delay).

    If delay > 0, prepend silence before the speech audio, then pad/trim the rest
    to fill the remaining window. This syncs narration to later visual events.
    """
    current_duration = get_duration(input_path)
    speech_window = target_duration - delay

    if speech_window <= 0:
        print(f"  ⚠️  Delay ({delay}s) >= window ({target_duration}s), using pure silence")
        subprocess.run([
            "ffmpeg", "-y", "-f", "lavfi", "-i",
            f"anullsrc=r=24000:cl=mono",
            "-t", str(target_duration),
            "-ar", "24000", "-ac", "1",
            output_path
        ], capture_output=True, check=True)
        return

    if delay > 0:
        # Generate silence + speech, then pad/trim to target
        temp_trimmed = input_path + ".trimmed.wav"
        if current_duration > speech_window:
            # Trim speech to fit remaining window
            subprocess.run([
                "ffmpeg", "-y", "-i", input_path,
                "-t", str(speech_window),
                "-af", f"afade=t=out:st={speech_window - 0.5}:d=0.5",
                "-ar", "24000", "-ac", "1",
                temp_trimmed
            ], capture_output=True, check=True)
            print(f"  ⚠️  Trimmed speech {current_duration:.1f}s → {speech_window:.1f}s")
        else:
            # Pad speech to fill remaining window
            pad_dur = speech_window - current_duration
            subprocess.run([
                "ffmpeg", "-y", "-i", input_path,
                "-af", f"apad=pad_dur={pad_dur}",
                "-t", str(speech_window),
                "-ar", "24000", "-ac", "1",
                temp_trimmed
            ], capture_output=True, check=True)

        # Prepend silence
        subprocess.run([
            "ffmpeg", "-y",
            "-f", "lavfi", "-i", f"anullsrc=r=24000:cl=mono",
            "-i", temp_trimmed,
            "-filter_complex", f"[0]atrim=0:{delay}[silence];[silence][1]concat=n=2:v=0:a=1",
            "-t", str(target_duration),
            "-ar", "24000", "-ac", "1",
            output_path
        ], capture_output=True, check=True)
        os.remove(temp_trimmed)
        print(f"  ✅ Delay {delay:.1f}s + speech {current_duration:.1f}s → {target_duration:.1f}s")
    elif current_duration >= target_duration:
        # Trim to target duration (fade out last 0.5s)
        subprocess.run([
            "ffmpeg", "-y", "-i", input_path,
            "-t", str(target_duration),
            "-af", f"afade=t=out:st={target_duration - 0.5}:d=0.5",
            "-ar", "24000", "-ac", "1",
            output_path
        ], capture_output=True, check=True)
        print(f"  ⚠️  Trimmed {current_duration:.1f}s → {target_duration:.1f}s")
    else:
        # Pad with silence at end
        silence_duration = target_duration - current_duration
        subprocess.run([
            "ffmpeg", "-y", "-i", input_path,
            "-af", f"apad=pad_dur={silence_duration}",
            "-t", str(target_duration),
            "-ar", "24000", "-ac", "1",
            output_path
        ], capture_output=True, check=True)
        print(f"  ✅ Padded {current_duration:.1f}s → {target_duration:.1f}s (silence: {silence_duration:.1f}s)")


def main():
    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print(f"🎤 Voice: {VOICE}")
    print(f"📁 Output: {OUTPUT_DIR}")
    print(f"📹 Video: {ORIGINAL_VIDEO}")
    print(f"⏱️  Segments: {len(SEGMENTS)}")
    print()

    # Step 1: Generate TTS for each segment
    print("=" * 60)
    print("STEP 1: Generating TTS segments")
    print("=" * 60)

    raw_paths = []
    for i, (start, end, delay, text) in enumerate(SEGMENTS):
        raw_path = os.path.join(OUTPUT_DIR, f"seg_{i:02d}_raw.mp3")
        raw_paths.append(raw_path)
        duration = end - start
        speech_window = duration - delay
        print(f"\n[{i+1}/{len(SEGMENTS)}] {start//60}:{start%60:02d} - {end//60}:{end%60:02d} ({duration}s, delay={delay}s, speech={speech_window}s)")
        print(f"  Text: {text[:60]}...")

        # First pass: generate at normal rate
        generate_tts(text, raw_path)
        actual = get_duration(raw_path)
        print(f"  Generated: {actual:.1f}s (window: {duration}s)")

        # If audio is too long, re-generate with faster rate
        if actual > speech_window + 0.5:  # 0.5s tolerance
            speed_ratio = actual / speech_window
            # Increase rate proportionally (cap at +50%)
            rate_pct = min(int((speed_ratio - 1.0) * 100) + 5, 50)  # +5% extra margin
            fast_rate = f"+{rate_pct}%"
            print(f"  ⚡ Re-generating with rate {fast_rate} (ratio: {speed_ratio:.2f}x)")
            generate_tts(text, raw_path, rate=fast_rate)
            actual = get_duration(raw_path)
            print(f"  Re-generated: {actual:.1f}s (window: {duration}s)")

    # Step 2: Pad/trim each segment to match time windows
    print("\n" + "=" * 60)
    print("STEP 2: Aligning segments to time windows")
    print("=" * 60)

    padded_paths = []
    for i, (start, end, delay, _) in enumerate(SEGMENTS):
        raw_path = raw_paths[i]
        padded_path = os.path.join(OUTPUT_DIR, f"seg_{i:02d}_padded.wav")
        padded_paths.append(padded_path)
        target_duration = end - start
        print(f"\n[{i+1}/{len(SEGMENTS)}] Segment {i:02d} (delay={delay}s):")
        pad_audio_to_duration(raw_path, padded_path, target_duration, delay=delay)

    # Step 3: Concatenate all padded segments
    print("\n" + "=" * 60)
    print("STEP 3: Concatenating segments into voiceover track")
    print("=" * 60)

    # Create concat file list
    concat_list = os.path.join(OUTPUT_DIR, "concat_list.txt")
    with open(concat_list, "w") as f:
        for path in padded_paths:
            f.write(f"file '{path}'\n")

    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", concat_list,
        "-ar", "24000", "-ac", "1",
        "-b:a", "192k",
        FINAL_VOICEOVER
    ], capture_output=True, check=True)

    voiceover_duration = get_duration(FINAL_VOICEOVER)
    print(f"\n✅ Voiceover generated: {FINAL_VOICEOVER}")
    print(f"   Duration: {voiceover_duration:.1f}s (video: {VIDEO_DURATION:.1f}s)")

    # Step 4: Merge voiceover with original video
    print("\n" + "=" * 60)
    print("STEP 4: Merging voiceover with video")
    print("=" * 60)

    if not os.path.exists(ORIGINAL_VIDEO):
        print(f"❌ Original video not found: {ORIGINAL_VIDEO}")
        print(f"   Voiceover saved to: {FINAL_VOICEOVER}")
        return

    subprocess.run([
        "ffmpeg", "-y",
        "-i", ORIGINAL_VIDEO,
        "-i", FINAL_VOICEOVER,
        "-c:v", "libx264",       # Re-encode video for compatibility
        "-preset", "medium",
        "-crf", "18",            # High quality
        "-c:a", "aac",           # AAC audio
        "-b:a", "192k",
        "-map", "0:v:0",         # Video from original
        "-map", "1:a:0",         # Audio from voiceover
        "-shortest",             # Match shortest stream
        "-movflags", "+faststart",  # Web-optimized
        FINAL_VIDEO
    ], capture_output=True, check=True)

    final_duration = get_duration(FINAL_VIDEO)
    final_size = os.path.getsize(FINAL_VIDEO) / (1024 * 1024)
    print(f"\n🎬 Final video: {FINAL_VIDEO}")
    print(f"   Duration: {final_duration:.1f}s")
    print(f"   Size: {final_size:.1f} MB")
    print(f"\n✨ Done! Video is ready for B站 upload.")


if __name__ == "__main__":
    main()
