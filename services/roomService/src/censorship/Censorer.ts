/* eslint-disable no-console */
import RegExp from 'typescript-dotnet-commonjs/System/Text/RegularExpressions';
import ICensorer from './ICensorer';

export default class Censorer implements ICensorer {

  private static _instance: Censorer;

  private _regexp = new RegExp('test', 'g', 'i');

  /* f[un]c?k?|[s5]h[i1!]?[e]?t|b[i1l]?t?ch|[ck][o0]c?k|[a4][s5][s5]|
    [db][i1]c?k|w?h[o0]re?|(f|ph)[a4]g|(d|k)[yi1l!]ke|ch[i1!]nk|pus?s[yi]|
    [ck]unt|c[o0][o0]n|p[e3][nm][il1!]s|v[a4]g|pr[o0][s5]t[il1!]t|
    [s5][l1]u[t]|[a4]r[s5][e3]|w[a4]nk|b[o0][o0]b
    */
  static getInstance(): Censorer {
    if (Censorer._instance === undefined) {
      Censorer._instance = new Censorer();
    }
    return Censorer._instance;
  }

  
  static replaceWithStars(toCensor: string):string {
    let ret = '';
    for (let i = 0; i < toCensor.length; i += 1) {
      ret += '*';
    }
    return ret;

  }

  censorMessage(incomingMessage: string): string {
    const words = incomingMessage.split(' ');
    let ret = '';
    words.forEach(curr => {
      if (this._regexp.isMatch(curr)) {
        ret += replaceWithStars(curr);
      } else {
        ret += curr;
      }
      
    });
    return ret;
    
  }

  addCensorshipPhrase(phrase: RegExp): void {
    console.log(phrase);
    console.log(this._regexp);
  }
  
  

}
