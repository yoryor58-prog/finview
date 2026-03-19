import { XMLParser } from 'fast-xml-parser';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// corp.xml 경로: 프로젝트 루트에 복사해두거나 Downloads 경로를 직접 지정
const xmlPaths = [
  resolve(__dirname, '../corp.xml'),
  resolve('C:/Users/yoryo/Downloads/corp.xml'),
];

let xmlPath = null;
for (const p of xmlPaths) {
  try {
    readFileSync(p);
    xmlPath = p;
    break;
  } catch {}
}

if (!xmlPath) {
  console.error('corp.xml을 찾을 수 없습니다. 프로젝트 루트에 corp.xml을 복사하거나 경로를 수정하세요.');
  process.exit(1);
}

console.log(`corp.xml 읽는 중: ${xmlPath}`);

const xml = readFileSync(xmlPath, 'utf-8');

const parser = new XMLParser({ ignoreAttributes: false });
const parsed = parser.parse(xml);

const lists = parsed?.result?.list;
if (!lists) {
  console.error('XML 파싱 실패: result.list 요소를 찾을 수 없습니다.');
  process.exit(1);
}

const corps = (Array.isArray(lists) ? lists : [lists]).map((item) => ({
  corpCode: String(item.corp_code ?? '').padStart(8, '0'),
  corpName: String(item.corp_name ?? ''),
  corpEngName: String(item.corp_eng_name ?? ''),
  stockCode: String(item.stock_code ?? '').trim(),
  modifyDate: String(item.modify_date ?? ''),
}));

const outputPath = resolve(__dirname, '../data/corps.json');
writeFileSync(outputPath, JSON.stringify(corps, null, 2), 'utf-8');

console.log(`완료: ${corps.length}개 회사 데이터가 ${outputPath}에 저장되었습니다.`);
