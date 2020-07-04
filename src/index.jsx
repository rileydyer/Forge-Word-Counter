import ForgeUI, { ContentAction, ModalDialog, render, Text, useAction, useProductContext, useState } from "@forge/ui";
import api from "@forge/api";

/*
Sources:
Used to parse json: http://techslides.com/how-to-parse-and-search-json-in-javascript
Used in setup and accessing Forge API: https://developer.atlassian.com/platform/forge/macros-in-the-page/#next-steps
*/
 
const get_content = async (contentId) => {
    const response = await api.asApp().requestConfluence(`/wiki/rest/api/content/${contentId}?expand=body.atlas_doc_format`);

    if (!response.ok) {
        const err = `Error while get_content with contentId ${contentId}: ${response.status} ${response.statusText}`;
        console.error(err);
        throw new Error(err);
    }
    return await response.json();
};

function count_words(str) {
  var num_words = 0;
  var all_words = []
  var ind = 0
  for (var i = 0; i < str.length; i+=1) {
    num_words += str[i].split(" ").length;
  }

  return num_words;
  return str[0].split(" ").length;
}

function get_values(obj, key) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(get_values(obj[i], key));
        } else if (i == key) {
            objects.push(obj[i]);
        }
    }
    return objects;
}

const countWords = (data) => {
    if (!data || !data.body || !data.body.atlas_doc_format || !data.body.atlas_doc_format.value) {
        return 5;
    }
    var jsoned = JSON.parse(data.body.atlas_doc_format.value);
    var values = get_values(jsoned, 'text');
    return count_words(values);
};

const App = () => {
    const [isOpen, setOpen] = useState(true);
    if (!isOpen) {
        return null;
    }

    const { contentId } = useProductContext();
    const [data] = useAction(
        () => null,
        async () => await get_content(contentId)
    );

    const wordCount = countWords(data);

    return (
        <ModalDialog header="Word counter:" onClose={() => setOpen(false)}>
            <Text>{`Number of words: ${wordCount}`}</Text>
        </ModalDialog>
    );
};

export const run = render(
    <ContentAction>
        <App/>
    </ContentAction>
);
