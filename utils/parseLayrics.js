const fs = require( 'fs' );
const path = require( 'path' );

function parseLyrics () {
    const lines = fs.readFileSync( path.join( process.cwd(), 'utils', 'song_book.txt' ) ).toString().split( '\n' );
    const authors = [];
    const lyrics = [];
    let lyInd = 0;
    lines.forEach( line => {
        if ( line.startsWith( '*' ) ) {
            authors.push( line.substring( 1 ).trim() );
            lyInd = 0;
        } else if ( line.startsWith( "~" ) ) {
            lyrics.push( {
                id: `${ authors.length - 1 }.${ lyInd }`,
                title: line.substring( 1 ).trim()
            } );
            lyInd++;
        } else if ( line.startsWith( "e:" ) ) {
            lyrics[ lyrics.length - 1 ].e = line.substring( 1 ).trim();
        }
    } );
    fs.writeFileSync( path.join( process.cwd(), 'utils', 'lyrics.json' ), JSON.stringify( lyrics ) );
}

parseLyrics();
