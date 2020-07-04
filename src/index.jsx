// Import required components from the Forge UI library
import ForgeUI, { ContentAction, ModalDialog, render, Text, useAction, useProductContext, useState } from "@forge/ui";
import api from "@forge/api";

const getContent = async (contentId) => {
    const response = await api.asApp().requestConfluence(`/wiki/rest/api/content/${contentId}?expand=body.atlas_doc_format`);

    if (!response.ok) {
        const err = `Error while getContent with contentId ${contentId}: ${response.status} ${response.statusText}`;
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
//return an array of values that match on a certain key
function getValues(obj, key) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getValues(obj[i], key));
        } else if (i == key) {
            objects.push(obj[i]);
        }
    }
    return objects;
}

const countMacros = (data) => {
    if (!data || !data.body || !data.body.atlas_doc_format || !data.body.atlas_doc_format.value) {
        return 5;
    }

    const { body: { atlas_doc_format: { value } } } = data;
    const { content: contentList } = JSON.parse(value);

    //return data.body.atlas_doc_format.value;

    var return_data = [];
    var num_words = 5;
    //first element is title, second element number of words
    return_data[0] = data.title;
    return_data[1] = data.body.atlas_doc_format.value;
    //return data.body.atlas_doc_format.value;

    var jsoned = JSON.parse(data.body.atlas_doc_format.value);

    var jsonified = jsoned['content'][0]['content'][0]['content'];
    var values = getValues(jsoned, 'text');
    //return values;
    //return typeof data.body.atlas_doc_format.value;
    return count_words(values);

    //return JSON.stringify(data, null, 4);;



    const macros = contentList.filter((content) => {
        return content.type === "extension";
    });

    return macros.length;
};

const App = () => {
    const [isOpen, setOpen] = useState(true);
    if (!isOpen) {
        return null;
    }

    const { contentId } = useProductContext();
    const [data] = useAction(
        () => null,
        async () => await getContent(contentId)
    );

    const macroCount = countMacros(data);

    return (
        <ModalDialog header="Word counter:" onClose={() => setOpen(false)}>
            <Text>{`Number of words: ${macroCount}`}</Text>
        </ModalDialog>
    );
};

export const run = render(
    <ContentAction>
        <App/>
    </ContentAction>
);
